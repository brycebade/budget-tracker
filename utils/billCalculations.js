const getMonthlyDueDate = (year, monthIndex, dueDay) => {
    const lastDayOfMonth = new Date(year, monthIndex + 1, 0).getDate()
    const actualDueDay = Math.min(dueDay, lastDayOfMonth)

    return new Date(year, monthIndex, actualDueDay)
}

export const getNextBillDueDate = (bill, referenceDate = new Date()) => {
    if (bill.frequency === "monthly") {
        const today = new Date(referenceDate)

        today.setHours(0, 0, 0, 0)

        const dueDay = bill.due_day

        let nextDueDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            dueDay
        )

        if (nextDueDate < today) {
            nextDueDate = new Date(
                today.getFullYear(),
                today.getMonth() + 1,
                dueDay
            )
        }

        return nextDueDate
    }

    if (
        bill.frequency === "weekly" ||
        bill.frequency === "biweekly"
    ) {
        const intervalDays = 
            bill.frequency === "weekly"
                ? 7
                : 14

        const [year, month, day] = 
            bill.anchor_date
                .split("T")[0]
                .split("-")
                .map(Number)

        const anchorDate = new Date(
            year,
            month - 1,
            day    
        )

        anchorDate.setHours(0, 0, 0, 0)

        const today = new Date()

        today.setHours(0, 0, 0, 0)

        if (anchorDate >= today) {
            return anchorDate
        }

        const millisecondsPerDay = 
            1000 * 60 * 60 * 24

        const daysSinceAnchor = Math.floor(
            (today - anchorDate) / millisecondsPerDay
        )

        const intervalsToNext = Math.ceil(
            daysSinceAnchor / intervalDays
        )

        const nextDueDate = new Date(anchorDate)

        nextDueDate.setDate(
            anchorDate.getDate() +
            (intervalsToNext * intervalDays)
        )

        return nextDueDate
    }

    return null
}

export const getPreviousBillDueDate = (bill, referenceDate = new Date()) => {
    if (bill.frequency === "monthly") {
        const today = new Date(referenceDate)

        today.setHours(0, 0, 0, 0)

        const dueDay = bill.due_day

        let previousDueDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            dueDay
        )

        if (previousDueDate > today) {
            previousDueDate = new Date(
                today.getFullYear(),
                today.getMonth() - 1,
                dueDay
            )
        }

        return previousDueDate
    }

    if (
        bill.frequency === "weekly" ||
        bill.frequency === "biweekly"
    ) {
        const intervalDays =
            bill.frequency === "weekly"
                ? 7
                : 14

        const [year, month, day] =
            bill.anchor_date   
                .split("T")[0]
                .split("-")
                .map(Number)

        const anchorDate = new Date(
            year,
            month - 1,
            day
        )

        anchorDate.setHours(0, 0, 0, 0)

        const today = new Date()

        today.setHours(0, 0, 0, 0)

        if (anchorDate > today) {
            return null
        }

        const millisecondsPerDay = 1000 * 60 * 60 * 24
        const daysSinceAnchor = Math.floor((today - anchorDate) / millisecondsPerDay)
        const intervalsSinceAnchor = Math.floor(daysSinceAnchor / intervalDays)
        const previousDueDate = new Date(anchorDate)

        previousDueDate.setDate(
            anchorDate.getDate() + (intervalsSinceAnchor * intervalDays)
        )

        return previousDueDate
    }
    
    return null
}

export const getCurrentMonthBillDueDate = (bill, referenceDate = new Date()) => {
    if (bill.frequency !== "monthly") {
        return null
    }

    const today = new Date(referenceDate)

    today.setHours(0, 0, 0, 0)

    const currentMonthDueDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        bill.due_day
    )

    return currentMonthDueDate
}

export const getFollowingBillDueDate = (bill, dueDate) => {
    const followingDueDate = new Date(dueDate)

    if (bill.frequency === "monthly") {
        followingDueDate.setMonth(
            followingDueDate.getMonth() + 1
        )

        return followingDueDate
    }

    if (bill.frequency === "weekly") {
        followingDueDate.setDate(
            followingDueDate.getDate() + 7
        )

        return followingDueDate
    }

    if (bill.frequency === "biweekly") {
        followingDueDate.setDate(
            followingDueDate.getDate() + 14
        )

        return followingDueDate
    }

    return followingDueDate
}

export const getBillDueDatesBetween = (bill, startDate, endDate) => {
    const rangeStart = new Date(startDate)
    const rangeEnd = new Date(endDate)

    rangeStart.setHours(0, 0, 0, 0)
    rangeEnd.setHours(0, 0, 0, 0)

    const dueDates = []

    if (bill.frequency === "monthly") {
        let year = rangeStart.getFullYear()
        let monthIndex = rangeStart.getMonth()
        let dueDate = getMonthlyDueDate(year, monthIndex, bill.due_day)

        if (dueDate < rangeStart) {
            monthIndex += 1

            dueDate = getMonthlyDueDate(year, monthIndex, bill.due_day)
        }

        while (dueDate <= rangeEnd) {
            dueDates.push(new Date(dueDate))

            monthIndex += 1

            dueDate = getMonthlyDueDate(year, monthIndex, bill.due_day)
        }
    }

        if (bill.frequency === "weekly" || bill.frequency === "biweekly") {
            const intervalDays = bill.frequency === "weekly" ? 7 : 14

            const [year, month, day] = bill.anchor_date
                .split("T")[0]
                .split("-")
                .map(Number)

            let dueDate = new Date(year, month - 1, day)

            while (dueDate < rangeStart) {
                dueDate.setDate(dueDate.getDate() + intervalDays)
            }

            while (dueDate <= rangeEnd) {
                dueDates.push(new Date(dueDate))

                dueDate.setDate(dueDate.getDate() + intervalDays)
            }
        }

    return dueDates
}

export const getBillOccurrencesBetween = (bill, startDate, endDate, billPayments) => {
    const dueDates = getBillDueDatesBetween(bill, startDate, endDate)
    const plannedAmount = Number(
        bill.planned_payment ??
        bill.expected_amount ??
        bill.minimum_payment ??
        0
    )

    return dueDates.map((dueDate) => {
        const year = dueDate.getFullYear()
        const month = String(dueDate.getMonth() + 1).padStart(2, "0")
        const day = String(dueDate.getDate()).padStart(2, "0")

        const dueDateKey = `${year}-${month}-${day}`

        const paidAmount = billPayments
            .filter((payment) => {
                return (
                    payment.bill_id === bill.id &&
                    payment.due_date?.split("T")[0] === dueDateKey
                )
            })
            .reduce((total, payment) => {
                return total + Number(payment.amount)
            }, 0)

            return {
                billId: bill.id,
                name: bill.name,
                dueDate: dueDateKey,
                plannedAmount,
                paidAmount,
                remainingAmount: Math.max(plannedAmount - paidAmount, 0)
            }
    })
}