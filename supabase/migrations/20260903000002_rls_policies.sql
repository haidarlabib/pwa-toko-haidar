-- ==============================================================================
-- HAIDAR PLASTIK MANAGEMENT PWA — ROW LEVEL SECURITY POLICIES
-- Migration: 20260903000002_rls_policies.sql
-- ==============================================================================

-- 1. HELPER FUNCTIONS FOR ROLE VALIDATION
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. ENABLE RLS ON ALL CORE TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- PROFILES POLICIES
-- ==============================================================================
CREATE POLICY "Public profiles are readable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Users can update own profile (excluding role)"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    (role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
  );

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin());

-- ==============================================================================
-- CATEGORIES POLICIES
-- ==============================================================================
CREATE POLICY "Categories are readable by authenticated users"
  ON public.categories FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Categories are manageable only by Admin"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.is_admin());

-- ==============================================================================
-- UNITS POLICIES
-- ==============================================================================
CREATE POLICY "Units are readable by authenticated users"
  ON public.units FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Units are manageable only by Admin"
  ON public.units FOR ALL
  TO authenticated
  USING (public.is_admin());

-- ==============================================================================
-- PRODUCTS POLICIES
-- ==============================================================================
-- Admin can perform all operations
CREATE POLICY "Products full access for Admin"
  ON public.products FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Non-admin / Staff can read active products
CREATE POLICY "Products read access for Staff"
  ON public.products FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- ==============================================================================
-- INSPECTION SCHEDULES POLICIES
-- ==============================================================================
CREATE POLICY "Inspection schedules readable by all authenticated"
  ON public.inspection_schedules FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Inspection schedules manageable only by Admin"
  ON public.inspection_schedules FOR ALL
  TO authenticated
  USING (public.is_admin());

-- ==============================================================================
-- PRICE HISTORY POLICIES
-- ==============================================================================
CREATE POLICY "Price history readable by all authenticated"
  ON public.price_history FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Price history insertable only by Admin"
  ON public.price_history FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- STOCK CHECKS POLICIES
-- ==============================================================================
CREATE POLICY "Stock checks readable by all authenticated"
  ON public.stock_checks FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Stock checks insertable by Staff"
  ON public.stock_checks FOR INSERT
  TO authenticated
  WITH CHECK (
    status = 'SUBMITTED' AND
    (auth.uid() = user_id OR user_id IS NULL)
  );

CREATE POLICY "Stock checks manageable by Admin"
  ON public.stock_checks FOR ALL
  TO authenticated
  USING (public.is_admin());

-- ==============================================================================
-- EDIT REQUESTS POLICIES
-- ==============================================================================
CREATE POLICY "Edit requests readable by all authenticated"
  ON public.edit_requests FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Staff can submit edit requests"
  ON public.edit_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    status = 'PENDING' AND
    (auth.uid() = requested_by OR requested_by IS NULL)
  );

CREATE POLICY "Edit requests manageable by Admin"
  ON public.edit_requests FOR ALL
  TO authenticated
  USING (public.is_admin());

-- ==============================================================================
-- ACTIVITY LOGS POLICIES
-- ==============================================================================
CREATE POLICY "Activity logs readable only by Admin"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Activity logs insertable by authenticated actions"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);
