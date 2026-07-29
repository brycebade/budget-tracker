import { renderLayout } from "./components/layout.js"
import { getAccounts } from "./api/accountsApi.js"

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
        const balance = calculateAccountBalance(account.id, account.balance)

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

const calculateAccountBalance = (accountId, startingBalance) => {
    let balance = startingBalance

    transactions.forEach((transaction) => {
        if (transaction.accountId !== accountId) return
        
        if (transaction.type === "income") {
            balance += transaction.amount
        } else if (transaction.type === "expense") {
            balance -= transaction.amount
        }
    })

    return balance
}

// RENDER FUNCTIONS

const renderDashboard = () => {
    const metrics = calculateDashboardMetrics()
    renderDashboardMetrics(metrics)
}

const renderDashboardMetrics = (metrics) => {
    availableCashValue.textContent = formatCurrency(metrics.availableCash)
    netWorthValue.textContent = formatCurrency(metrics.netWorth)
    savingsValue.textContent = formatCurrency(metrics.savings)
    investmentsValue.textContent = formatCurrency(metrics.investments)
    retirementValue.textContent = formatCurrency(metrics.retirement)
    totalDebtValue.textContent = formatCurrency(metrics.totalDebt)
}

// EVENT LISTENERS

// INITIALIZATION

const loadAccounts = async () => {
    try {
        const savedAccounts = await getAccounts()

        const formattedAccounts = savedAccounts.map((account) => ({
            id: account.id,
            name: account.name,
            type: account.type,
            balance: Number(account.opening_balance)
        }))

        accounts.push(...formattedAccounts)

        renderDashboard()
    } catch(error) {
        console.error("Accounts could not be loaded:", error)
    }
}

loadAccounts()