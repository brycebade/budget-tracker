CREATE TABLE income_deductions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    income_source_id uuid NOT NULL
        REFERENCES income_sources(id)
        ON DELETE CASCADE,

    name text NOT NULL,

    category text NOT NULL
        CHECK (
            category IN (
                'insurance',
                'retirement',
                'tax',
                'other'
            )
        ),

    method text NOT NULL
        CHECK (
            method IN ('fixed', 'percentage')
        ),

    value numeric(12,2) NOT NULL
        CHECK (
            value > 0
            AND (
                method = 'fixed'
                OR value <= 100
            )
        ),

    active boolean NOT NULL DEFAULT true,

    created_at timestamptz NOT NULL DEFAULT now()
);