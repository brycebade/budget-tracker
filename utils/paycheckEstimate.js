import { calculateGrossPay } from "./paycheckCalculations.js"
import { calculatePaycheckDeductions } from "./deductionCalculations.js"
import { calculateDepositDistribution } from "./depositCalculations.js"
import { calculatePayrollTaxEstimate } from "./taxCalculations.js"

export const estimatePaycheck = (payDetails, deductions) => {
    const grossResults = calculateGrossPay(payDetails)

    const deductionResult = calculatePaycheckDeductions(grossResults.grossPay, deductions)

    return {
        ...grossResults,
        totalDeductions: deductionResult.totalDeductions,
        netPay: deductionResult.netPay,
        deductionsBreakdown: deductionResult.breakdown
    }
}

export const estimatePaycheckDeposits = (payDetails, deductions, depositRules) => {
    const estimate = estimatePaycheck(payDetails, deductions)

    const depositDistribution = calculateDepositDistribution(estimate.netPay, depositRules)

    return {
        ...estimate,
        depositDistribution: depositDistribution
    }
}

export const estimatePaycheckWithFica = (payDetails, deductions, taxOptions = {}) => {
    const estimate = estimatePaycheck(payDetails, deductions)
    const payrollTaxes = calculatePayrollTaxEstimate(estimate.grossPay, deductions, taxOptions)
    const fica = payrollTaxes.ficaWithholding
    const netCents = Math.round(estimate.netPay * 100) - Math.round(fica.totalFica * 100)

    if (netCents < 0) {
        throw new Error("Deductions and taxes exceed gross pay")
    }

    return {
        ...estimate,
        taxableWages: payrollTaxes.taxableWages,
        ficaWithholding: fica,
        estimatedNetAfterFica: netCents / 100
    }
}