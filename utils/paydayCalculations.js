export const getPaycheckPeriod = (referencePayday, referenceDate = new Date()) => {
    const payday = new Date(referencePayday)
    const today = new Date(referenceDate)

    payday.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    const millisecondsPerDay = 1000 * 60 * 60 * 24

    const daysSinceReference = Math.round(
        (
            Date.UTC(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            ) -
            Date.UTC(
                payday.getFullYear(),
                payday.getMonth(),
                payday.getDate()
            )
        ) / millisecondsPerDay
    )

    const paycheckPeriodsPassed = Math.floor(daysSinceReference / 14)
    
    const startDate = new Date(payday)
    startDate.setDate(payday.getDate() + paycheckPeriodsPassed * 14)

    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 13)

    const nextPayday = new Date(startDate)
    nextPayday.setDate(startDate.getDate() + 14)

    return {startDate, endDate, nextPayday}
}

export const getNextPayday = (incomeSource, referenceDate = new Date()) => {
    const today = new Date(referenceDate)
    today.setHours(0, 0, 0, 0)

    if(incomeSource.frequency === "monthly") {
        const payDay = Number(incomeSource.pay_day_1)

        if (
            !Number.isInteger(payDay) ||
            payDay < 1 ||
            payDay > 31
        ) {
            return null
        }

        const getMonthlyPayday = (year, monthIndex) => {
            const lastDayOfMonth = new Date(
                year,
                monthIndex + 1,
                0
            ).getDate()

            const actualPayDay = Math.min(payDay, lastDayOfMonth)

            return new Date(year, monthIndex, actualPayDay)
        }

        let nextPayday = getMonthlyPayday(
            today.getFullYear(),
            today.getMonth()
        )

        if (nextPayday < today) {
            nextPayday = getMonthlyPayday(
                today.getFullYear(),
                today.getMonth() + 1
            )
        }

        return nextPayday
    }

    if (incomeSource.frequency === "semimonthly") {
        const payDay1 = Number(incomeSource.pay_day_1)
        const payDay2 = Number(incomeSource.pay_day_2)

        const validPayDay = (day) => {
            return Number.isInteger(day) && day >= 1 && day <= 31
        }

        if (
            !validPayDay(payDay1) ||
            !validPayDay(payDay2) ||
            payDay1 === payDay2
        ) {
            return null
        }

        const getScheduledPayDay = (year, monthIndex, day) => {
            const lastDayOfMonth = new Date(year, monthIndex + 1, 0).getDate()

            return new Date(year, monthIndex, Math.min(day, lastDayOfMonth))
        }

        const year = today.getFullYear()
        const monthIndex = today.getMonth()

        const upcomingPaydays = [
            getScheduledPayDay(year, monthIndex, payDay1),
            getScheduledPayDay(year, monthIndex, payDay2),
            getScheduledPayDay(year, monthIndex + 1, payDay1),
            getScheduledPayDay(year, monthIndex + 1, payDay2)
        ]

        const nextPayDay = upcomingPaydays
            .filter((date) => date >= today)
            .sort((dateA, dateB) => dateA - dateB)[0]

        return nextPayDay ?? null
    }

    if (
        incomeSource.frequency !== "weekly" &&
        incomeSource.frequency !== "biweekly"
    ) {
        return null
    }

    const anchorDate = incomeSource.anchor_date?.split("T")[0]

    if (!anchorDate) {
        return null
    }

    const payday = new Date(`${anchorDate}T00:00:00`)

    if (incomeSource.frequency === "weekly") {
        while (payday < today) {
            payday.setDate(payday.getDate() + 7)
        }

        return payday
    }

    const paycheckPeriod = getPaycheckPeriod(payday, today)

    if(paycheckPeriod.startDate.getTime() === today.getTime()) {
        return paycheckPeriod.startDate
    }

    return paycheckPeriod.nextPayday
}