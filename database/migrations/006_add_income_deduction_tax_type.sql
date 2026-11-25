ALTER TABLE income_deductions
ADD COLUMN tax_type TEXT;

ALTER TABLE income_deductions
ADD CONSTRAINT income_deductions_tax_type_check
CHECK (
    tax_type IS NULL
    OR (
        category = 'tax'
        AND tax_type IN (
            'federal_income',
            'state_income',
            'social_security',
            'medicare',
            'additional_medicare',
            'other_tax'
        )
    )
);