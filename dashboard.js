import { renderLayout } from "./components/layout.js"
import { getAccounts } from "./api/accountsApi.js"
import { getTransactions } from "./api/transactionsApi.js"
import { getTransactionBalanceChange } from "./utils/financialCalculations.js"
import { getBills } from "./api/billsApi.js"
import { getBillPayments } from "./api/billPaymentsApi.js"
import { getBillOccurrencesBetween } from "./utils/billCalculations.js"

renderLayout({
    title: "Dashboard",
    activePage: "dashboard"
})

const availableCashValue = document.getElementById("availableCashValue")
const netWorthValue = document.getElementById("netWorthValue")
const totalDebtValue = document.getElementById("totalDebtValue")
const savingsValue = document.getElementById("savingsValue")
const investmentsValue = document.getElementById("investmentsValue")
const retirementValue = document.getElementById("retirementValue")
const recentTransactionsContainer = document.getElementById("recentTransactionsContainer")
const dashboardCashBalance = document.getElementById("dashboardCashBalance")
const dashboardBillsAmount = document.getElementById("dashboardBillsAmount")
const dashboardBillsSubtitle = document.getElementById("dashboardBillsSubtitle")
const dashboardUpcomingObligations = document.getElementById("dashboardUpcomingObligations")

const accounts = []
const transactions = []
const bills = []
const billPayments = []

const formatCurrency = (amount) => {
    const currency = amount.toLocaleString("en-US", {
        style:"currency", 
        currency:"USD"
    })
    return currency
}

const formatAccountType = (type) => {
    const accountTypeLabels = {
        checking: "Checking",
        savings: "Savings",
        investments: "Investments",
        retirement: "Retirement",
        credit_card: "Credit Card",
        loan: "Loan"
    }

    return accountTypeLabels[type]
}

const calculateDashboardMetrics = () => {
    const metrics = {
        availableCash: 0,
        savings: 0,
        investments: 0,
        retirement: 0,
        totalDebt: 0,
        netWorth: 0
    }

    accounts.forEach((account) => {
        const balance = Number(account.current_balance)

        if (account.type === "checking") {
            metrics.availableCash += balance
            metrics.netWorth += balance
        } else if (account.type === "savings") {
            metrics.savings += balance
            metrics.netWorth += balance
        } else if (account.type === "investments") {
            metrics.investments += balance
            metrics.netWorth += balance
        } else if (account.type === "retirement") {
            metrics.retirement += balance
            metrics.netWorth += balance
        } else if (account.type === "credit_card") {
            metrics.totalDebt += balance
            metrics.netWorth -= balance
        } else if (account.type === "loan") {
            metrics.totalDebt += balance
            metrics.netWorth -= balance
        }
    })

    return metrics
}

const renderDashboard = () => {
    const metrics = calculateDashboardMetrics()

    renderDashboardMetrics(metrics)
    renderRecentTransactions()
}

const renderDashboardMetrics = (metrics) => {
    availableCashValue.textContent = formatCurrency(metrics.availableCash)
    netWorthValue.textContent = formatCurrency(metrics.netWorth)
    savingsValue.textContent = formatCurrency(metrics.savings)
    investmentsValue.textContent = formatCurrency(metrics.investments)
    retirementValue.textContent = formatCurrency(metrics.retirement)
    totalDebtValue.textContent = formatCurrency(metrics.totalDebt)
    dashboardCashBalance.textContent = formatCurrency(metrics.availableCash)
}

const renderRecentTransactions = () => {
    if (transactions.length === 0) {
        recentTransactionsContainer.innerHTML = `
            <div class="p-4 text-base-content/60">
                No recent transactions to display.
            </div>
        `

        return
    }

    const recentTransactions = transactions.slice(0, 5)

    recentTransactionsContainer.innerHTML = ""

    recentTransactions.forEach((transaction) => {
        const account = accounts.find((account) => {
            return account.id === transaction.account_id
        })

        if (!account) return

        const balanceChange = getTransactionBalanceChange(
            account,
            transaction
        )

        const amountPrefix = balanceChange < 0 ? "-" : "+"

        const isDebtAccount =
            account.type === "credit_card" ||
            account.type === "loan"

            const amountClass = isDebtAccount
                ? balanceChange > 0
                    ? "text-error"
                    : "text-success"
                : balanceChange < 0
                    ? "text-error"
                    : "text-success"

        recentTransactionsContainer.innerHTML += `
            <div class="grid grid-cols-[minmax(0,1fr)_90px_75px_95px_90px] items-center gap-2 border-b border-base-300 px-3 py-2 last:border-b-0">
                
                <span class="truncate font-semibold">
                    ${transaction.description}
                </span>

                <span class="truncate text-sm text-base-content/60">
                    ${account.name}
                </span>

                <span class="truncate text-sm capitalize text-base-content/60">
                    ${transaction.type.replaceAll("_", " ")}
                </span>

                <span class="text-sm text-base-content/60">
                    ${transaction.transaction_date}
                </span>
                
                <span class="text-right font-semibold tabular-nums ${amountClass}">
                    ${amountPrefix}${formatCurrency(transaction.amount)}
                </span>
            </div>
        `
    })
}

const renderUpcomingObligations = (occurrences) => {
    dashboardUpcomingObligations.innerHTML = ""

    if (occurrences.length === 0) {
        dashboardUpcomingObligations.innerHTML = `
            <p class="p-4 text-sm text-base-content/60">
                No unpaid obligations for this paycheck period.
            </p>
        `
        return
    }

    const sortedOccurrences = [...occurrences].sort((a, b) => {
        return a.dueDate.localeCompare(b.dueDate)
    })

    sortedOccurrences.forEach((occurrence) => {
        const [year, month, day] = occurrence.dueDate
            .split("-")
            .map(Number)

        const dueDate = new Date(year, month - 1, day)

        const monthLabel = dueDate.toLocaleDateString("en-US", {
            month: "short"
        })

        dashboardUpcomingObligations.innerHTML += `
            <div class="flex items-center gap-4 border-b border-base-300 p-4">
                <div class="w-12 shrink-0">
                    <p class="text-xs font-medium uppercase text-base-content/50">
                        ${monthLabel}
                    </p>
                    <p class="text-xl font-bold">
                        ${day}
                    </p>
                </div>

                <div class="min-w-0 flex-1">
                    <p class="font-medium">
                        ${occurrence.name}
                    </p>
                    <p class="mt-1 text-xs text-base-content/50">
                        Unpaid
                    </p>
                </div>

                <p class="shrink-0 font-semibold">
                    ${formatCurrency(occurrence.remainingAmount)}
                </p>
            </div>
        `
    })
}

const loadDashboardData = async () => {
    try {
        const [
            savedAccounts, 
            savedTransactions,
            savedBills,
            savedBillPayments
        ] = await Promise.all([
            getAccounts(),
            getTransactions(),
            getBills(),
            getBillPayments()
        ])

        accounts.length = 0
        transactions.length = 0
        bills.length = 0
        billPayments.length = 0

        accounts.push(...savedAccounts)
        transactions.push(...savedTransactions)
        bills.push(...savedBills)
        billPayments.push(...savedBillPayments)

        const referencePayDay = new Date(2026, 9, 30)
        const today = new Date()

        referencePayDay.setHours(0, 0, 0, 0)
        today.setHours(0, 0, 0, 0)

        const millisecondsPerDay = 1000 * 60 * 60 *24

        const daysSinceReference = Math.round(
            (
                Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
                Date.UTC(
                    referencePayDay.getFullYear(),
                    referencePayDay.getMonth(),
                    referencePayDay.getDate()
                )
            ) / millisecondsPerDay
        )

        const paycheckPeriodsPassed = Math.floor(daysSinceReference / 14)
        const testStartDate = new Date(referencePayDay)

        testStartDate.setDate(referencePayDay.getDate() + paycheckPeriodsPassed * 14)

        const testEndDate = new Date(testStartDate)
        
        testEndDate.setDate(testStartDate.getDate() + 13)

        const nextPayday = new Date(testStartDate)

        nextPayday.setDate(testStartDate.getDate() + 14)

        const formattedNextPayday = nextPayday.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        })

        console.log("Paycheck period:", testStartDate, testEndDate)

        const upcomingBillOccurrences = bills
            .filter((bill) => bill.active === true)
            .flatMap((bill) => {
                return getBillOccurrencesBetween(bill, testStartDate, testEndDate, billPayments)
            })

        const unpaidBillOccurrences = upcomingBillOccurrences.filter((occurrence) => {
            return occurrence.remainingAmount > 0
        })

        renderUpcomingObligations(unpaidBillOccurrences)

        const billsBeforePayday = unpaidBillOccurrences.reduce((total, occurrence) => {
            return total + occurrence.remainingAmount
        }, 0)

        dashboardBillsAmount.textContent = formatCurrency(billsBeforePayday)

        dashboardBillsSubtitle.textContent = `${unpaidBillOccurrences.length} unpaid obligations • Next Payday ${formattedNextPayday}`

        renderDashboard()

    } catch(error) {
        console.error("Accounts could not be loaded:", error)
    }
}

loadDashboardData()

const financialPathElement = document.getElementById("financialPathChart")
const financialPathChart = echarts.init(financialPathElement)

const financialPathOptions = {
    tooltip: {
        trigger: "axis"
    },

    grid: {
        left: 10,
        right: 10,
        top: 20,
        bottom: 10,
        containLabel: true
    },

    xAxis: {
        type: "category",
        boundaryGap: false,
        data: ["Mon", "Tue", "Today", "Thu", "Fri"],
        axisLine: {
            lineStyle: {
                color: "#3b424c"
            }
        },
        axisTick: {
            show: false
        },
        axisLabel: {
            color: "#8b9eb7"
        }
    },

    yAxis: {
        type: "value",
        axisLine: {
            show: false
        },
        axisTick: {
            show: false
        },
        axisLabel: {
            color: "#8b9eb7"
        },
        splitLine: {
            lineStyle: {
                color: "#3b424c",
                opacity: 0.35
            }
        }
    },

    series: [
        {
            name: "Actual",
            type: "line",
            smooth: true,
            symbol: "circle",
            symbolSize: 7,
            data: [1200, 1350, 1280, 1425, 1510],
            lineStyle: {
                width: 3,
                color: "#8b9eb7"
            },
            itemStyle: {
                color: "#8b9eb7"
            },
            areaStyle: {
                color: "rgba(139, 158, 183, 0.08)"
            },
            markLine: {
                silent: true,
                symbol: "none",
                label: {
                    show: true,
                    formatter: "Today",
                    color: "#8b9eb7"
                },
                lineStyle: {
                    color: "#8b9eb7",
                    type: "dashed",
                    opacity: 0.6
                },
                data: [
                    {
                        xAxis: "Today"
                    }
                ]
            }
        },

        {
            name: "Projected",
            type: "line",
            smooth: true,
            symbol: "circle",
            symbolSize: 7,
            data: [null, null, 1280, 1425, 1510],
            lineStyle: {
                width: 3,
                type: "dashed",
                color: "#8b9eb7"
            },
            itemStyle: {
                color: "#8b9eb7"
            }
        }
    ]
}

financialPathChart.setOption(financialPathOptions)

window.addEventListener("resize", () => {
    financialPathChart.resize()
})