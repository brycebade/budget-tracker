import { createAccount, getAccounts } from "./api/accountsApi.js"

// DOM REFERENCES

const form = document.getElementById("accountForm")
const acctName = document.getElementById("accountName")
const acctType = document.getElementById("accountType")
const acctBalance = document.getElementById("accountBalance")
const acctContainer = document.getElementById("accountContainer")
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

const renderAccounts = () => {
    acctContainer.innerHTML = ""

    for (const account of accounts) {
        const balance = calculateAccountBalance(account.id, account.balance)

        acctContainer.innerHTML += `
            <div>
                <h2>${account.name}</h2>
                <p>${account.type}</p>
                <p>${formatCurrency(balance)}</p>
            </div>
        `
    }
}

const renderDashboard = () => {
    renderAccounts()

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

form.addEventListener("submit", async (event) => {
    event.preventDefault()   

    const accountData = {
        name: acctName.value,
        type: acctType.value,
        openingBalance: Number(acctBalance.value)
    }

    try {
        const savedAccount = await createAccount(accountData)

        accounts.push({
            id: savedAccount.id,
            name: savedAccount.name,
            type: savedAccount.type,
            balance: savedAccount.opening_balance
        })

        renderDashboard()

        acctName.value = ""
        acctType.value = ""
        acctBalance.value = ""
    } catch (error) {
        console.error("Account could not be saved:", error)
    }
})

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