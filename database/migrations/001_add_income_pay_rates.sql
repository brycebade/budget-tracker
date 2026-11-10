ALTER TABLE income_sources
ADD COLUMN hourly_rate NUMERIC(10,2)
    CHECK (hourly_rate > 0),
ADD COLUMN overtime_multiplier NUMERIC(4,2)
    NOT NULL DEFAULT 1.50
    CHECK (overtime_multiplier > 0);