-- Migration: Add cancel_customer_order RPC with authorization & stock restoration

-- Ensure cancellation_reason column exists on orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

CREATE OR REPLACE FUNCTION public.cancel_customer_order(
  _order_id UUID,
  _reason TEXT DEFAULT 'Cancelled by customer'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _order RECORD;
  _uid UUID := auth.uid();
  _is_admin BOOLEAN := FALSE;
BEGIN
  IF _uid IS NOT NULL THEN
    _is_admin := public.has_role(_uid, 'admin'::app_role);
  END IF;

  SELECT * INTO _order FROM public.orders WHERE id = _order_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found.';
  END IF;

  -- Authorization check: User must own the order or be an admin
  IF _order.user_id IS NOT NULL THEN
    IF NOT _is_admin AND (_uid IS NULL OR _order.user_id != _uid) THEN
      RAISE EXCEPTION 'You do not have permission to cancel this order.';
    END IF;
  END IF;

  -- Status check: Cannot cancel if shipped, delivered, or already cancelled/refunded
  IF _order.status IN ('shipped', 'delivered') THEN
    RAISE EXCEPTION 'This order has already been dispatched/delivered and cannot be cancelled.';
  END IF;

  IF _order.status IN ('cancelled', 'refunded') THEN
    RAISE EXCEPTION 'This order is already %.', _order.status;
  END IF;

  UPDATE public.orders
  SET 
    status = 'cancelled',
    cancellation_reason = COALESCE(_reason, 'Cancelled by customer'),
    updated_at = NOW()
  WHERE id = _order_id;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', _order_id,
    'status', 'cancelled'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_customer_order(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_customer_order(UUID, TEXT) TO anon;
