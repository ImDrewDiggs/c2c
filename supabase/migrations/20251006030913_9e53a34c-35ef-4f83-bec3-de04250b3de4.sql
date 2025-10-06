-- Phase 1: Fix Critical RLS Policies
-- Remove any implicit public access and ensure all policies require authentication

-- ====================================================================
-- PROFILES TABLE - PII Data
-- ====================================================================

-- Drop existing policies and recreate with explicit role restrictions
DROP POLICY IF EXISTS "Users can view own basic profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all basic profiles" ON public.profiles;
DROP POLICY IF EXISTS "Restrict pay_rate to super admins and self" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile with PII restrictions" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- SELECT policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (is_admin_by_email());

-- INSERT policies
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can insert any profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (is_admin_by_email());

-- UPDATE policies
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (is_admin_by_email());

-- ====================================================================
-- SUBSCRIBERS TABLE - Subscription Data
-- ====================================================================

DROP POLICY IF EXISTS "Users view own subscription by user_id only" ON public.subscribers;
DROP POLICY IF EXISTS "Users insert own subscription by user_id only" ON public.subscribers;
DROP POLICY IF EXISTS "Users update own subscription by user_id only" ON public.subscribers;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscribers;

CREATE POLICY "Users can view own subscription"
ON public.subscribers FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all subscriptions"
ON public.subscribers FOR SELECT
TO authenticated
USING (is_admin_by_email());

CREATE POLICY "Users can insert own subscription"
ON public.subscribers FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subscription"
ON public.subscribers FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all subscriptions"
ON public.subscribers FOR ALL
TO authenticated
USING (is_admin_by_email());

-- ====================================================================
-- EMPLOYEE_LOCATIONS TABLE - Location Tracking Data
-- ====================================================================

DROP POLICY IF EXISTS "Employees can view own recent location" ON public.employee_locations;
DROP POLICY IF EXISTS "Employees can insert own location" ON public.employee_locations;
DROP POLICY IF EXISTS "Employees can update own current location" ON public.employee_locations;
DROP POLICY IF EXISTS "Admins can view all employee locations" ON public.employee_locations;
DROP POLICY IF EXISTS "Admins can insert employee locations" ON public.employee_locations;
DROP POLICY IF EXISTS "Admins can update employee locations" ON public.employee_locations;

CREATE POLICY "Employees can view own location"
ON public.employee_locations FOR SELECT
TO authenticated
USING (employee_id = auth.uid());

CREATE POLICY "Admins can view all locations"
ON public.employee_locations FOR SELECT
TO authenticated
USING (is_admin_by_email());

CREATE POLICY "Employees can insert own location"
ON public.employee_locations FOR INSERT
TO authenticated
WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Admins can insert locations"
ON public.employee_locations FOR INSERT
TO authenticated
WITH CHECK (is_admin_by_email());

CREATE POLICY "Employees can update own location"
ON public.employee_locations FOR UPDATE
TO authenticated
USING (employee_id = auth.uid());

CREATE POLICY "Admins can update locations"
ON public.employee_locations FOR UPDATE
TO authenticated
USING (is_admin_by_email());

-- ====================================================================
-- ORDERS TABLE - Financial Data
-- ====================================================================

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

CREATE POLICY "Users can view own orders"
ON public.orders FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
TO authenticated
USING (is_admin_by_email());

CREATE POLICY "Users can create own orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own orders"
ON public.orders FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all orders"
ON public.orders FOR ALL
TO authenticated
USING (is_admin_by_email());

-- ====================================================================
-- PAYMENTS TABLE - Financial Data
-- ====================================================================

DROP POLICY IF EXISTS "Users can view own payment history only" ON public.payments;
DROP POLICY IF EXISTS "Users can create their own payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payments;

CREATE POLICY "Users can view own payments"
ON public.payments FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all payments"
ON public.payments FOR SELECT
TO authenticated
USING (is_admin_by_email());

CREATE POLICY "Users can create own payments"
ON public.payments FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all payments"
ON public.payments FOR ALL
TO authenticated
USING (is_admin_by_email());

-- ====================================================================
-- MESSAGES TABLE - Communication Data
-- ====================================================================

DROP POLICY IF EXISTS "Users can view own messages with audit" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their sent messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can manage all messages" ON public.messages;

CREATE POLICY "Users can view own messages"
ON public.messages FOR SELECT
TO authenticated
USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Admins can view all messages"
ON public.messages FOR SELECT
TO authenticated
USING (is_admin_by_email());

CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update sent messages"
ON public.messages FOR UPDATE
TO authenticated
USING (sender_id = auth.uid());

CREATE POLICY "Admins can manage all messages"
ON public.messages FOR ALL
TO authenticated
USING (is_admin_by_email());

-- ====================================================================
-- WORK_SESSIONS TABLE - Employee Time Tracking
-- ====================================================================

DROP POLICY IF EXISTS "Employees can view their own work sessions" ON public.work_sessions;
DROP POLICY IF EXISTS "Employees can create their own work sessions" ON public.work_sessions;
DROP POLICY IF EXISTS "Employees can update their own work sessions" ON public.work_sessions;
DROP POLICY IF EXISTS "Admins can manage all work sessions" ON public.work_sessions;

CREATE POLICY "Employees can view own sessions"
ON public.work_sessions FOR SELECT
TO authenticated
USING (employee_id = auth.uid());

CREATE POLICY "Admins can view all sessions"
ON public.work_sessions FOR SELECT
TO authenticated
USING (is_admin_by_email());

CREATE POLICY "Employees can create own sessions"
ON public.work_sessions FOR INSERT
TO authenticated
WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can update own sessions"
ON public.work_sessions FOR UPDATE
TO authenticated
USING (employee_id = auth.uid());

CREATE POLICY "Admins can manage all sessions"
ON public.work_sessions FOR ALL
TO authenticated
USING (is_admin_by_email());

-- ====================================================================
-- SUBSCRIPTIONS TABLE - Service Subscriptions
-- ====================================================================

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can create their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view own subscriptions"
ON public.subscriptions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all subscriptions"
ON public.subscriptions FOR SELECT
TO authenticated
USING (is_admin_by_email());

CREATE POLICY "Users can create own subscriptions"
ON public.subscriptions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subscriptions"
ON public.subscriptions FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all subscriptions"
ON public.subscriptions FOR ALL
TO authenticated
USING (is_admin_by_email());

-- ====================================================================
-- HOUSES TABLE - Property Data
-- ====================================================================

DROP POLICY IF EXISTS "Employees can view assigned houses" ON public.houses;
DROP POLICY IF EXISTS "Admins can manage all houses" ON public.houses;

CREATE POLICY "Assigned employees can view houses"
ON public.houses FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM assignments
    WHERE assignments.house_id = houses.id
    AND assignments.employee_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all houses"
ON public.houses FOR SELECT
TO authenticated
USING (is_admin_by_email());

CREATE POLICY "Admins can manage all houses"
ON public.houses FOR ALL
TO authenticated
USING (is_admin_by_email());

-- ====================================================================
-- VEHICLES TABLE - Fleet Data
-- ====================================================================

DROP POLICY IF EXISTS "Employees can view assigned vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Admins can manage all vehicles" ON public.vehicles;

CREATE POLICY "Assigned employees can view vehicles"
ON public.vehicles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM vehicle_assignments
    WHERE vehicle_assignments.vehicle_id = vehicles.id
    AND vehicle_assignments.employee_id = auth.uid()
    AND (vehicle_assignments.unassigned_date IS NULL OR vehicle_assignments.unassigned_date >= CURRENT_DATE)
  )
);

CREATE POLICY "Admins can view all vehicles"
ON public.vehicles FOR SELECT
TO authenticated
USING (is_admin_by_email());

CREATE POLICY "Admins can manage all vehicles"
ON public.vehicles FOR ALL
TO authenticated
USING (is_admin_by_email());

-- ====================================================================
-- OTPS TABLE - One-Time Passwords (Highly Sensitive)
-- ====================================================================

DROP POLICY IF EXISTS "OTP users can view own unexpired OTPs" ON public.otps;

CREATE POLICY "Users can view own unexpired OTPs"
ON public.otps FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  AND expires_at > now()
  AND used = false
);