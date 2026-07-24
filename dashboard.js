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
        if (account.type === "checking") {
            metrics.availableCash += account.balance
            metrics.netWorth += account.balance
        } else if (account.type === "savings") {
            metrics.savings += account.balance
            metrics.netWorth += account.balance
        } else if (account.type === "investments") {
            metrics.investments += account.balance
            metrics.netWorth += account.balance
        } else if (account.type === "retirement") {
            metrics.retirement += account.balance
            metrics.netWorth += account.balance
        } else if (account.type === "credit_card") {
            metrics.totalDebt += account.balance
            metrics.netWorth -= account.balance
        } else if (account.type === "loan") {
            metrics.totalDebt += account.balance
            metrics.netWorth -= account.balance
        }
    })

    return metrics
}

// RENDER FUNCTIONS

const renderAccounts = () => {
    acctContainer.innerHTML = ""

    for (const account of accounts) {
        acctContainer.innerHTML += `
            <div>
                <h2>${account.name}</h2>
                <p>${account.type}</p>
                <p>$${account.balance}</p>
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

form.addEventListener("submit", (event) => {
    event.preventDefault()   

    const account = {
        id: crypto.randomUUID(),
        name: acctName.value,
        type: acctType.value,
        balance: Number(acctBalance.value)
    }

    accounts.push(account)
    renderDashboard()

    acctName.value = ""
    acctType.value = ""
    acctBalance.value = ""
})