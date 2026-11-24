ALTER TABLE income_deductions
ADD COLUMN reduces_federal_taxable_wages BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN reduces_state_taxable_wages BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN reduces_fica_taxable_wages BOOLEAN NOT NULL DEFAULT FALSE;