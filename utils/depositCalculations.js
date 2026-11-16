export const calculateDepositDistribution = (netPay, rules) => {
    const netCents = Math.round(Number(netPay) * 100)

    if (!Number.isFinite(netCents) || netCents < 0) {
        throw new Error("Invalid paycheck amount")
    }

    const allocations = []
    let allocatedCents = 0
    let remainderRule = null

    for (const rule of rules) {
        if (rule.method === "remainder") {
            if (remainderRule) {
                throw new Error("Only one remainder account is allowed")
            }

            remainderRule = rule
            continue
        }

        if (
            rule.method !== "fixed" &&
            rule.method !== "percentage"
        ) {
            throw new Error("Unsupported distribution method")
        }

        const value = Number(rule.value)

        if (
            rule.value == null ||
            !Number.isFinite(value) ||
            value <= 0 ||
            (rule.method === "percentage" && value > 100)
        ) {
            throw new Error("Invalid deposit amount")
        }

        const amountCents = 
            rule.method === "fixed"
                ? Math.round(value * 100)
                : Math.round(netCents * value / 100)

        if (!Number.isFinite(amountCents) || amountCents <= 0) {
            throw new Error("Invalid deposit amount")
        }

        allocatedCents += amountCents

        allocations.push({
            accountId: rule.account_id,
            amount: amountCents / 100
        })
    }

    if (!remainderRule) {
        throw new Error("A remainder account is required")
    }

    if (allocatedCents > netCents) {
        throw new Error("Deposits exceed the paycheck amount")
    }

    allocations.push({
        accountId: remainderRule.account_id,
        amount: (netCents - allocatedCents) / 100
    })

    return allocations
}