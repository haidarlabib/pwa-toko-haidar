-- HAIDAR PLASTIK ADMIN MANAGEMENT PWA (v2.0 Revised)
-- Relational Product Inspection Schedules & Constraints (PRD Sections 41-43, 89)

DO $$ BEGIN
    CREATE TYPE day_of_week_enum AS ENUM (
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
        'SUNDAY'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS product_inspection_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    day_of_week day_of_week_enum NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_product_day UNIQUE (product_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_prod_sched_product ON product_inspection_schedules(product_id);
CREATE INDEX IF NOT EXISTS idx_prod_sched_day ON product_inspection_schedules(day_of_week);
