import { renderLayout } from "./components/layout.js"
import { getAccounts } from "./api/accountsApi.js"
import { getTransactions } from "./api/transactionsApi.js"
import { getTransactionBalanceChange } from "./utils/financialCalculations.js"
import { getBills } from "./api/billsApi.js"
import { getBillPayments } from "./api/billPaymentsApi.js"
import { getBillOccurrencesBetween } from "./utils/billCalculations.js"
import { getPaycheckPeriod } from "./utils/paydayCalculations.js"

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
const dashboardMonthlyIncome = document.getElementById("dashboardMonthlyIncome")
const dashboardMoneyFlowCategories = document.getElementById("dashboardMoneyFlowCategories")

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

const calculateMoneyFlow = (
    transactions, 
    accounts,
    bills,
    billPayments,
    startDate, 
    endDate
) => {
    const accountMap = new Map(
        accounts.map((account) => [account.id, account])
    )

    const billMap = new Map(
        bills.map((bill) => [bill.id, bill])
    )

    const billPaymentMap = new Map(
        billPayments.map((payment) => [payment.id, payment])
    )

    const moneyFlow = {
        income: 0,
        purchases: 0,
        billSpending: 0,
        unclassifiedPayments: 0,
        debtRepayments: 0
    }

    transactions.forEach((transaction) => {
        const transactionDate = transaction.transaction_date

        if (
            transactionDate < startDate ||
            transactionDate > endDate
        ) {
            return
        }

        const account = accountMap.get(transaction.account_id)

        if (!account) {
            return
        }

        const amount = Number(transaction.amount)

        if (
            transaction.type === "income" &&
            (account.type === "checking" || account.type === "savings")
        ) {
            moneyFlow.income += amount
        }

        if (
            transaction.type === "expense" &&
            (
                account.type === "checking" ||
                account.type === "savings" ||
                account.type === "credit_card"
            )
        ) {
            moneyFlow.purchases += amount
        }

        if (
            transaction.type === "payment" &&
            (
                account.type === "checking" ||
                account.type === "savings"
            )
        ) {
            const billPayment = billPaymentMap.get(
                transaction.bill_payments_id
            )

            const bill = billPayment
                ? billMap.get(billPayment.bill_id)
                : null

            if (billPayment && bill) {
                const linkedAccount = accountMap.get(
                    bill.linked_account_id
                )

                if (
                    linkedAccount?.type === "credit_card" ||
                    linkedAccount?.type === "loan"
                ) {
                    moneyFlow.debtRepayments += amount
                } else {
                    moneyFlow.billSpending += amount
                }
            } else {
                moneyFlow.unclassifiedPayments += amount
            }
        }
    })

    return moneyFlow
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
    dashboardUpcomingObligations.replaceChildren()

    if (occurrences.length === 0) {
        const message = document.createElement("p")

        message.className = "p-4 text-sm text-base-content/60"
        message.textContent = "No upcoming unpaid obligations."

        dashboardUpcomingObligations.appendChild(message)
        return
    }

    const sortedOccurrences = [...occurrences].sort((a, b) => {
        return a.dueDate.localeCompare(b.dueDate)
    })

    sortedOccurrences.forEach((occurrence) => {
        const bill = bills.find((bill) => bill.id === occurrence.billId)

        const fundingAccount = accounts.find((account) => {
            return account.id === bill?.funding_account_id
        })

        const category = bill?.category || "Uncategorized"
        const fundingAccountName = fundingAccount?.name || "No funding account"

        const paymentStatus = occurrence.paidAmount > 0
            ? "Partially paid"
            : "Unpaid"

        const [year, month, day] = occurrence.dueDate
            .split("-")
            .map(Number)

        const dueDate = new Date(year, month - 1, day)

        const monthLabel = dueDate.toLocaleDateString("en-US", {
            month: "short"
        })

        const row = document.createElement("div")
        row.className = "flex items-center gap-4 border-b border-base-300 p-4"

        const dateContainer = document.createElement("div")
        dateContainer.className = "w-12 shrink-0"

        const monthElement = document.createElement("p")
        monthElement.className = "text-xs font-medium uppercase text-base-content/50"
        monthElement.textContent = monthLabel

        const dayElement = document.createElement("p")
        dayElement.className = "text-xl font-bold"
        dayElement.textContent = day

        dateContainer.append(monthElement, dayElement)

        const detailsContainer = document.createElement("div")
        detailsContainer.className = "min-w-0 flex-1"

        const nameElement = document.createElement("p")
        nameElement.className = "font-medium"
        nameElement.textContent = occurrence.name

        const detailsElement = document.createElement("p")
        detailsElement.className = "mt-1 text-xs text-base-content/50"
        detailsElement.textContent = `${category} · ${fundingAccountName} · ${paymentStatus}`

        detailsContainer.append(nameElement, detailsElement)

        const amountElement = document.createElement("p")
        amountElement.className = "shrink-0 font-semibold"
        amountElement.textContent = formatCurrency(occurrence.remainingAmount)

        row.append(dateContainer, detailsContainer, amountElement)

        dashboardUpcomingObligations.appendChild(row)
    })
}

const renderMoneyFlowCategories = (moneyFlow) => {
    dashboardMoneyFlowCategories.replaceChildren()

    const categories = [
        { name: "Purchases", amount: moneyFlow.purchases },
        { name: "Bills", amount: moneyFlow.billSpending },
        { name: "Debt Repayments", amount: moneyFlow.debtRepayments },
        { name: "Unclassified Payments", amount: moneyFlow.unclassifiedPayments }
    ]

    const totalOutflow = categories.reduce((total, category) => {
        return total + category.amount
    }, 0)

    if (totalOutflow === 0) {
        const message = document.createElement("p")

        message.className = "text-sm text-base-content/60"
        message.textContent = "No recorded outflows for this period."

        dashboardMoneyFlowCategories.appendChild(message)
        return
    }

    categories
        .filter((category) => category.amount > 0)
        .forEach((category) => {
            const percentage = (category.amount / totalOutflow) * 100

            const wrapper = document.createElement("div")
            const header = document.createElement("div")
            const nameElement = document.createElement("span")
            const amountElement = document.createElement("span")
            const progressTrack = document.createElement("div")
            const progressBar = document.createElement("div")


            header.className = "mb-1 flex items-center justify-between gap-4"
            nameElement.className = "text-sm font-medium"
            amountElement.className = "text-sm text-base-content/70"
            progressTrack.className = "h-2 w-full rounded-full bg-base-300"
            progressBar.className = "h-2 rounded-full bg-accent"

            nameElement.textContent = category.name
            amountElement.textContent = formatCurrency(category.amount)

            progressBar.style.width = `${percentage}%`

            header.append(nameElement, amountElement)
            progressTrack.appendChild(progressBar)
            wrapper.append(header, progressTrack)
            dashboardMoneyFlowCategories.appendChild(wrapper)    
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

        const currentMonthStart = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            "01"
        ].join("-")

        const lastDayOfMonth = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
        ).getDate()

        const currentMonthEnd = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(lastDayOfMonth).padStart(2, "0")
        ].join("-")

        const moneyFlowTest = calculateMoneyFlow(
            transactions, 
            accounts, 
            bills,
            billPayments,
            currentMonthStart, 
            currentMonthEnd
        )

        renderMoneyFlowCategories(moneyFlowTest)

        console.log("Money Flow categories container:", dashboardMoneyFlowCategories)

        dashboardMonthlyIncome.textContent = formatCurrency(moneyFlowTest.income)

        console.log("Money Flow Period:", currentMonthStart, currentMonthEnd)

        console.log("Transactions in period:", transactions.filter((transaction) => {
            return (
                transaction.transation_date >= currentMonthStart &&
                transaction.transaction_date <= currentMonthEnd
            )
        }).length
    )

        console.log("Money Flow Tests:", moneyFlowTest)

        referencePayDay.setHours(0, 0, 0, 0)
        
        const {startDate, endDate, nextPayday} = getPaycheckPeriod(referencePayDay)
        const testStartDate = startDate
        const testEndDate = endDate

        const formattedNextPayday = nextPayday.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        })

        const upcomingBillOccurrences = bills
            .filter((bill) => bill.active === true)
            .flatMap((bill) => {
                return getBillOccurrencesBetween(bill, testStartDate, testEndDate, billPayments)
            })

        const upcomingWindowEnd = new Date()
        upcomingWindowEnd.setHours(0, 0, 0, 0)
        upcomingWindowEnd.setDate(upcomingWindowEnd.getDate() + 30)

        const upcomingWindowStart = new Date()
        upcomingWindowStart.setHours(0, 0, 0, 0)

        const nextUpcomingOccurrences = bills
            .filter((bill) => bill.active === true)
            .flatMap((bill) => {
                return getBillOccurrencesBetween(bill, upcomingWindowStart, upcomingWindowEnd, billPayments)
            })
            .filter((occurrence) => occurrence.remainingAmount > 0)
            .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
            .slice(0, 5)

        const unpaidBillOccurrences = upcomingBillOccurrences.filter((occurrence) => {
            return occurrence.remainingAmount > 0
        })

        renderUpcomingObligations(nextUpcomingOccurrences)

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