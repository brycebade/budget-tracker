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

    const availableCash = calculateAvailableCash()
    console.log(availableCash)

    acctName.value = ""
    acctType.value = ""
    acctBalance.value = ""
})

const calculateDashboardMetrics = () => {
    const metrics = {
        availableCash: 0,
        savingsAndInvestments: 0,
        totalDebt: 0,
        netWorth: 0
    }

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