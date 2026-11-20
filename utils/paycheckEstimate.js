import { calculateGrossPay } from "./paycheckCalculations.js"
import { calculatePaycheckDeductions } from "./deductionCalculations.js"
import { calculateDepositDistribution } from "./depositCalculations.js"

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