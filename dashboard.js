import { renderLayout } from "./components/layout.js"
import { getAccounts } from "./api/accountsApi.js"
import { getTransactions } from "./api/transactionsApi.js"
import { calculateCurrentBalance, getTransactionBalanceChange } from "./utils/financialCalculations.js"

renderLayout({
    title: "Dashboard",
    activePage: "dashboard"
})

// DOM REFERENCES

const availableCashValue = document.getElementById("availableCashValue")
const netWorthValue = document.getElementById("netWorthValue")
const totalDebtValue = document.getElementById("totalDebtValue")
const savingsValue = document.getElementById("savingsValue")
const investmentsValue = document.getElementById("investmentsValue")
const retirementValue = document.getElementById("retirementValue")
const recentTransactionsContainer = document.getElementById("recentTransactionsContainer")

// STATE

const accounts = []
const transactions = []

// HELPER FUNCTIONS

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

// BUSINESS LOGIC

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
        const accountTransactions = transactions.filter((transaction) => {
            return transaction.account_id === account.id
        })

        const balance = calculateCurrentBalance(
            account,
            accountTransactions
        )

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

// RENDER FUNCTIONS

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

// EVENT LISTENERS

// INITIALIZATION

const loadDashboardData = async () => {
    try {
        const [savedAccounts, savedTransactions] = await Promise.all([
            getAccounts(),
            getTransactions()
        ])

        const formattedAccounts = savedAccounts.map((account) => ({
            id: account.id,
            name: account.name,
            type: account.type,
            balance: Number(account.opening_balance)
        }))

        accounts.push(...formattedAccounts)
        transactions.push(...savedTransactions)

        renderDashboard()

    } catch(error) {
        console.error("Accounts could not be loaded:", error)
    }
}

loadDashboardData()