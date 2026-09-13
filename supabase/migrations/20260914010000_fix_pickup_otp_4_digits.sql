-- ==============================================================================
-- Fix: Revert Seller Pickup Handover PIN to 4-digits (matching Rider Apps UI)
-- ==============================================================================

-- 1. Update trigger function to generate 4-digit numeric PIN (1000 - 9999)
CREATE OR REPLACE FUNCTION public.generate_order_pickup_otp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.pickup_otp IS NULL OR length(NEW.pickup_otp) != 4 THEN
    -- Generate random 4-digit numeric PIN (1000 - 9999)
    NEW.pickup_otp := lpad(floor(1000 + random() * 9000)::int::text, 4, '0');
    NEW.pickup_otp_created_at := NOW();
    NEW.pickup_otp_failed_attempts := 0;
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Ensure trigger is attached to orders table
DROP TRIGGER IF EXISTS trg_generate_order_pickup_otp ON public.orders;
CREATE TRIGGER trg_generate_order_pickup_otp
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_order_pickup_otp();

-- 3. Update existing active orders whose pickup_otp is currently 6 digits to 4 digits
UPDATE public.orders
SET pickup_otp = lpad(floor(1000 + random() * 9000)::int::text, 4, '0'),
    pickup_otp_failed_attempts = 0,
    pickup_otp_created_at = NOW()
WHERE status IN ('pending', 'confirmed', 'processing')
  AND (pickup_otp IS NULL OR length(pickup_otp) != 4);
