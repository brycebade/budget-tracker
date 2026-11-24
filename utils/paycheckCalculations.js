export const calculateRegularPay = (hours, hourlyRate) => {
    const workedHours = Number(hours)
    const rate = Number(hourlyRate)

    if (
        !Number.isFinite(workedHours) ||
        !Number.isFinite(rate) ||
        workedHours < 0 ||
        rate < 0
    ) {
        throw new Error("Hours and hourly rate must be valid non-negative numbers")
    }

    const regularPay = workedHours * rate

    return Math.round((regularPay + Number.EPSILON) * 100) / 100
}

export const calculateOvertimePay = (hours, hourlyRate, overtimeMultiplier = 1.5) => {
    const overtimeHours = Number(hours)
    const rate = Number(hourlyRate)
    const multiplier = Number(overtimeMultiplier)

    if (
        !Number.isFinite(overtimeHours) ||
        !Number.isFinite(rate) ||
        !Number.isFinite(multiplier) ||
        overtimeHours < 0 ||
        rate < 0 ||
        multiplier < 1
    ) {
        throw new Error("Invalid overtime hours, rate, or multiplier")
    }

    const overtimePay = overtimeHours * rate * multiplier

    return Math.round((overtimePay + Number.EPSILON) * 100) / 100 
}

export const calculateShiftDifferential = (hours, hourlyRate, differentialPercent, multiplier = 1) => {
    const workedHours = Number(hours)
    const rate = Number(hourlyRate)
    const percent = Number(differentialPercent)
    const payMultiplier = Number(multiplier)

    if (
        !Number.isFinite(workedHours) ||
        !Number.isFinite(rate) ||
        !Number.isFinite(percent) ||
        !Number.isFinite(payMultiplier) ||
        workedHours < 0 ||
        rate < 0 ||
        percent < 0 ||
        percent > 100 ||
        payMultiplier < 1
    ) {
        throw new Error("Invalid shift differential inputs")
    }

    const differentialPay = workedHours * rate * payMultiplier * (percent / 100)

    return Math.round((differentialPay + Number.EPSILON) * 100) / 100
}

export const calculateAdditionalEarnings = (earnings, hourlyRate) => {
    if (!Array.isArray(earnings)) {
        throw new Error("Additional earnings must be an array")
    }

    const totalCents = earnings.reduce((total, earning) => {
        let amount

        const method = earning.method ?? "fixed"

        const rawValue = method === "hourly"
            ? earning.hours
            : earning.amount

        if (
            rawValue === null ||
            rawValue === undefined ||
            String(rawValue).trim() === "" ||
            !["number", "string"].includes(typeof rawValue) ||
            !Number.isFinite(Number(rawValue)) ||
            Number(rawValue) < 0
        ) {
            throw new Error("Additional earnings must be valid non-negative numbers")
        }

        if (method === "hourly") {
            amount = calculateRegularPay(
                earning.hours,
                hourlyRate
            )
        } else if (method === "fixed") {
            amount = Number(earning.amount)
        } else {
            throw new Error("Invalid earning method")
        }

        if (!Number.isFinite(amount) || amount < 0) {
            throw new Error("Invalid additional earning amount")
        }

        return total + Math.round(amount * 100)
    }, 0)

    return totalCents / 100
}

export const calculateGrossPay = ({
    regularHours,
    overtimeHours,
    hourlyRate,
    overtimeMultiplier = 1.5,
    regularDifferentialHours = 0,
    overtimeDifferentialHours = 0,
    differentialPercent = 0,
    additionalEarnings = []
}) => {
    const regularPay = calculateRegularPay(regularHours, hourlyRate)

    const overtimePay = calculateOvertimePay(overtimeHours, hourlyRate, overtimeMultiplier)

    if (
        Number(regularDifferentialHours) > Number(regularHours) ||
        Number(overtimeDifferentialHours) > Number(overtimeHours)
    ) {
        throw new Error("Differential hours cannot exceed hours worked")
    }

    const regularDifferential = calculateShiftDifferential(regularDifferentialHours, hourlyRate, differentialPercent)
    const overtimeDifferential = calculateShiftDifferential(overtimeDifferentialHours, hourlyRate, differentialPercent, overtimeMultiplier)
    const shiftDifferentialPay = Math.round((regularDifferential + overtimeDifferential) * 100) / 100
    const additionalEarningsPay = calculateAdditionalEarnings(additionalEarnings, hourlyRate)

    const totalCents = 
        Math.round(regularPay * 100) +
        Math.round(overtimePay * 100) +
        Math.round(shiftDifferentialPay * 100) +
        Math.round(additionalEarningsPay * 100)

    return {
        regularPay: regularPay,
        overtimePay: overtimePay,
        shiftDifferentialPay: shiftDifferentialPay,
        additionalEarningsPay: additionalEarningsPay,
        grossPay: totalCents / 100
    }
}