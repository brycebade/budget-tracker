BEGIN;

ALTER TABLE income_sources
DROP CONSTRAINT income_sources_pay_type_check;

ALTER TABLE income_sources
ADD CONSTRAINT income_sources_pay_type_check
CHECK (
    pay_type IN (
        'hourly',
        'salary',
        'fixed',
        'variable'
    )
);

ALTER TABLE income_sources
DROP CONSTRAINT income_sources_frequency_check;

ALTER TABLE income_sources
ADD CONSTRAINT income_sources_frequency_check
CHECK (
    frequency IN (
        'weekly',
        'biweekly',
        'semimonthly',
        'monthly',
        'irregular'
    )
);

COMMIT;