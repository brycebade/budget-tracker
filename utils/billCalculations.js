export const getNextBillDueDate = (bill) => {
    if (bill.frequency === "monthly") {
        const today = new Date()

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

export const getPreviousBillDueDate = (bill) => {
    if (bill.frequency === "monthly") {
        const today = new Date()

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