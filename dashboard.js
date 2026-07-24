// DOM References

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

// State

const accounts = []

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

// Render Functions

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
    availableCashValue.textContent = metrics.availableCash
    netWorthValue.textContent = metrics.netWorth
    savingsValue.textContent = metrics.savings
    investmentsValue.textContent = metrics.investments
    retirementValue.textContent = metrics.retirement
    totalDebtValue.textContent = metrics.totalDebt
}

// Event Listeners

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