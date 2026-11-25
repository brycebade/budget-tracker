import { calculateDeductionAmount } from "./deductionCalculations.js"

export const calculateTaxableWages = (grossPay, deductions) => {
    const gross = Number(grossPay)

    if (!Number.isFinite(gross) || gross < 0) {
        throw new Error("Invalid gross pay")
    }

    if (!Array.isArray(deductions)) {
        throw new Error("Deductions must be an array")
    }

    const grossCents = Math.round(gross * 100)

    let federalCents = grossCents
    let stateCents = grossCents
    let ficaCents = grossCents

    for (const deduction of deductions) {
        if (deduction.active === false || deduction.category === "tax") {
            continue
        }

        const amount = calculateDeductionAmount(gross, deduction)
        const deductionCents = Math.round(amount * 100)

        if (deduction.reduces_federal_taxable_wages === true) {
            federalCents -= deductionCents
        }

        if (deduction.reduces_state_taxable_wages === true) {
            stateCents -= deductionCents
        }

        if (deduction.reduces_fica_taxable_wages === true) {
            ficaCents -= deductionCents
        }
    }

    if (federalCents < 0 || stateCents < 0 || ficaCents < 0) {
        throw new Error("Taxable wage deductions exceeds gross pay")
    }

    return {
        federalTaxableWages: federalCents / 100,
        stateTaxableWages: stateCents / 100,
        ficaTaxableWages: ficaCents / 100
    }
}

export const calculateFicaWithholding = (
    ficaTaxableWages,
    taxYear = 2026,
    socialSecurityWagesYtd = 0,
    medicareWagesYtd = 0
) => {
    const socialSecurityWageLimits = {
        2026: 184500,
        2027: 192399
    }

    const wageLimit = socialSecurityWageLimits[taxYear]

    if (wageLimit === undefined) {
        throw new Error("Unsupported tax year")
    }

    const wages = Number(ficaTaxableWages)
    const socialSecurityYtd = Number(socialSecurityWagesYtd)
    const medicareYtd = Number(medicareWagesYtd)

    if (
        !Number.isFinite(wages) ||
        !Number.isFinite(socialSecurityYtd) ||
        !Number.isFinite(medicareYtd) ||
        wages < 0 ||
        socialSecurityYtd < 0 ||
        medicareYtd < 0
    ) {
        throw new Error("Invalid FICA taxable wages")
    }

    const wagesCents = Math.round(wages * 100)
    const socialSecurityYtdCents = Math.round(socialSecurityYtd * 100)
    const medicareYtdCents = Math.round(medicareYtd * 100)
    const wageLimitCents = wageLimit * 100

    const socialSecurityTaxableCents = Math.min(
        wagesCents,
        Math.max(0, wageLimitCents - socialSecurityYtdCents)
    )

    const socialSecurityCents = Math.round(socialSecurityTaxableCents * 0.062)
    const medicareCents = Math.round(wagesCents * 0.0145)
    const additionalMedicareThresholdCents = 200000 * 100

    const additionalMedicareTaxableCents = Math.min(
        wagesCents,
        Math.max(
            0,
            medicareYtdCents + wagesCents - additionalMedicareThresholdCents
        )
    )

    const additionalMedicareCents = Math.round(additionalMedicareTaxableCents * 0.009)
    const totalCents = socialSecurityCents + medicareCents + additionalMedicareCents

    return {
        socialSecurityCents: socialSecurityCents / 100,
        medicare: medicareCents / 100,
        additionalMedicareCents: additionalMedicareCents / 100,
        totalFica: totalCents / 100
    }
}

export const calculatePayrollTaxEstimate = (grossPay, deductions, options = {}) => {
    const taxYear = options.taxYear ?? 2026

    const socialSecurityWagesYtd = options.socialSecurityWagesYtd ?? 0
    const medicareWagesYtd = options.medicareWagesYtd ?? 0
    const taxableWages = calculateTaxableWages(grossPay, deductions)
    const ficaWithholding = calculateFicaWithholding(
        taxableWages.ficaTaxableWages,
        taxYear,
        socialSecurityWagesYtd,
        medicareWagesYtd
    )

    return {
        taxableWages: taxableWages,
        ficaWithholding: ficaWithholding
    }
}