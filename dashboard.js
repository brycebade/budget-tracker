const form = document.getElementById("accountForm")
const acctName = document.getElementById("accountName")
const acctType = document.getElementById("accountType")
const acctBalance = document.getElementById("accountBalance")
const acctContainer = document.getElementById("accountContainer")

const accounts = []

form.addEventListener("submit", (event) => {
    event.preventDefault()   

    const account = {
        id: crypto.randomUUID(),
        name: acctName.value,
        type: acctType.value,
        balance: Number(acctBalance.value)
    }

    accounts.push(account)
    renderAccounts()

    const availableCash = calculateDashboardMetrics()
    console.log(availableCash)

    acctName.value = ""
    acctType.value = ""
    acctBalance.value = ""
})

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
            metrics.investment += account.balance
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