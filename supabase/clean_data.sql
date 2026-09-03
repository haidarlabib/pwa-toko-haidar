-- ==============================================================================
-- HAIDAR PLASTIK — CLEAN ALL BUSINESS/DEMO DATA
-- Safely truncates business data while preserving schema, RLS, triggers & views.
-- ==============================================================================

TRUNCATE TABLE
  public.edit_requests,
  public.stock_checks,
  public.price_history,
  public.inspection_schedules,
  public.activity_logs,
  public.products,
  public.categories,
  public.units
RESTART IDENTITY CASCADE;
