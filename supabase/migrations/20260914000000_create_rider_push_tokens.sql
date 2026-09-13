-- Create rider_push_tokens table for background push notification delivery
CREATE TABLE IF NOT EXISTS public.rider_push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fcm_token TEXT NOT NULL,
    platform TEXT DEFAULT 'android',
    device_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_fcm_token UNIQUE (user_id, fcm_token)
);

-- Enable RLS
ALTER TABLE public.rider_push_tokens ENABLE ROW LEVEL SECURITY;

-- Index for fast lookup when dispatching notifications
CREATE INDEX IF NOT EXISTS idx_rider_push_tokens_user_id ON public.rider_push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_rider_push_tokens_token ON public.rider_push_tokens(fcm_token);

-- RLS Policies
CREATE POLICY "Riders can manage their own push tokens"
    ON public.rider_push_tokens
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role and admins can view push tokens"
    ON public.rider_push_tokens
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );
