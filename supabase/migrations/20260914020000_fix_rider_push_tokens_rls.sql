-- Ensure rider_push_tokens has explicit INSERT and UPDATE policies for authenticated riders
ALTER TABLE public.rider_push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Riders can manage their own push tokens" ON public.rider_push_tokens;
DROP POLICY IF EXISTS "Service role and admins can view push tokens" ON public.rider_push_tokens;
DROP POLICY IF EXISTS "Riders can insert their own push tokens" ON public.rider_push_tokens;
DROP POLICY IF EXISTS "Riders can update their own push tokens" ON public.rider_push_tokens;
DROP POLICY IF EXISTS "Riders can select their own push tokens" ON public.rider_push_tokens;
DROP POLICY IF EXISTS "Riders can delete their own push tokens" ON public.rider_push_tokens;

-- 1. Insert policy
CREATE POLICY "Riders can insert their own push tokens"
    ON public.rider_push_tokens
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 2. Update policy
CREATE POLICY "Riders can update their own push tokens"
    ON public.rider_push_tokens
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. Select policy
CREATE POLICY "Riders can select their own push tokens"
    ON public.rider_push_tokens
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 4. Delete policy
CREATE POLICY "Riders can delete their own push tokens"
    ON public.rider_push_tokens
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
