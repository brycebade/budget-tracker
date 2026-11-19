export const calculateDeductionAmount = (grossPay, deduction) => {
    const grossCents = Math.round(Number(grossPay) * 100)
    const value = Number(deduction.value)

    if (
        deduction.value === null ||
        deduction.value === undefined ||
        deduction.value === "" ||
        !Number.isFinite(value) ||
        value <= 0
    ) {
        throw new Error("Deduction amount must be greater than zero")
    }

    if (deduction.method === "percentage" && value > 100) {
        throw new Error("Deduction percentage cannot exceed 100%")
    }

    if (deduction.method === "fixed") {
        return Math.round(value * 100) / 100
    }

    if (deduction.method === "percentage") {
        const deductionCents = Math.round(grossCents * value / 100)

        return deductionCents / 100
    }

    throw new Error("Invalid deduction method")
}

export const calculatePaycheckDeductions = (grossPay, deductions) => {
    const grossCents = Math.round(Number(grossPay) * 100)

    if (!Number.isFinite(grossCents) || grossCents < 0) {
        throw new Error("Gross pay must be zero or greater")
    }

    const activeDeductions = deductions.filter((deduction) => {
        return deduction.active !== false
    })

    const breakdown = activeDeductions.map((deduction) => {
        const amount = calculateDeductionAmount(grossPay, deduction)

        return {
            name: deduction.name,
            category: deduction.category,
            method: deduction.method,
            amount: amount
        }
    })

    const totalDeductionCents = breakdown.reduce((total, deduction) => {
        return total + Math.round(deduction.amount * 100)
    }, 0)

    if (totalDeductionCents > grossCents) {
        throw new Error("Deductions cannot exceed gross pay")
    }

    return {
        grossPay: grossCents / 100,
         totalDeductionCents: totalDeductionCents / 100,
         netPay: (grossCents - totalDeductionCents) / 100,
         breakdown: breakdown
    }
}