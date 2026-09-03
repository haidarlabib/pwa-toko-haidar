-- ==============================================================================
-- HAIDAR PLASTIK — AUTOMATIC SKU GENERATION & COLUMN OPTIMIZATION
-- Migration: 20260904000001_auto_sku_cleanup.sql
-- ==============================================================================

-- 1. Create Sequence for SKU generation
CREATE SEQUENCE IF NOT EXISTS public.product_sku_seq START 1;

-- 2. Create Trigger Function to generate deterministic, unique SKU (e.g. HP-PLS-0001)
CREATE OR REPLACE FUNCTION public.generate_product_sku()
RETURNS TRIGGER AS $$
DECLARE
  v_seq BIGINT;
  v_sku TEXT;
BEGIN
  IF NEW.sku IS NULL OR TRIM(NEW.sku) = '' THEN
    LOOP
      v_seq := nextval('public.product_sku_seq');
      v_sku := 'HP-PLS-' || LPAD(v_seq::TEXT, 4, '0');
      IF NOT EXISTS (SELECT 1 FROM public.products WHERE sku = v_sku) THEN
        NEW.sku := v_sku;
        EXIT;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach BEFORE INSERT Trigger on products table
DROP TRIGGER IF EXISTS trigger_generate_product_sku ON public.products;
CREATE TRIGGER trigger_generate_product_sku
  BEFORE INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_product_sku();
