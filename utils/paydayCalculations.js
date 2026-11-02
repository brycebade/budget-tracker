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