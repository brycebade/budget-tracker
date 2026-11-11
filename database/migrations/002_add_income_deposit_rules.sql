CREATE TABLE income_deposit_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    income_source_id uuid NOT NULL
        REFERENCES incomes_sources(id)
        ON DELETE CASCADE,

    account_id uuid NOT NULL
        REFERENCES accounts(id)
        ON DELETE RESTRICT,

    method text NOT NULL
        CHECK (method IN ('fixed', 'percentage', 'remainder')),

    value numeric(12,2),

    CHECK (
        (method = 'fixed' AND value > 0)
        OR 
        (method = 'percentage' AND value > 0 AND value <= 100)
        OR
        (method = 'remainder' AND value IS NULL)
    ),

    UNIQUE (income_source_id, account_id)
);

CREATE UNIQUE INDEX one_remainder_per_income_source
ON income_deposit_rules (income_source_id)
WHERE method = 'remainder';