import { renderLayout } from "./components/layout.js"
import { renderAccountModal } from "./accountModal.js"
import { createAccount, getAccounts } from "./api/accountsApi.js"

renderLayout({
    title: "Accounts",
    activePage: "accounts",
    actionLabel: "Add Account +"
})

const accountModal = renderAccountModal()
const accountForm = document.getElementById("accountForm")
const accountName = document.getElementById("accountName")
const accountType = document.getElementById("accountType")
const accountBalance = document.getElementById("accountBalance")
const actionButton = document.getElementById("pageActionButton")
const cancelAccountButton = document.getElementById("cancelAccountButton")
const accountContainer = document.getElementById("accountContainer")
const creditCardFields = document.getElementById("creditCardFields")
const loanFields = document.getElementById("loanFields")
const accountApr = document.getElementById("accountApr")
const paymentDueDate = document.getElementById("paymentDueDate")
const minimumPayment = document.getElementById("minimumPayment")
const loanApr = document.getElementById("loanApr")
const scheduledPayment = document.getElementById("scheduledPayment")
const nextDueDate = document.getElementById("nextDueDate")
const paymentFrequency = document.getElementById("paymentFrequency")
const statementClosingDate = document.getElementById("statementClosingDate")

const accounts = []

actionButton.addEventListener("click", () => {
    accountModal.showModal()
})

cancelAccountButton.addEventListener("click", () => {
    accountModal.close()
})

accountForm.addEventListener("submit", async (event) => {
    event.preventDefault()

    let accountDetails = null

    if (accountType.value === "credit_card") {
        accountDetails = {
            apr: Number(accountApr.value),
            statementClosingDate: Number(statementClosingDate.value),
            dueDay: Number(paymentDueDate.value),
            minimumPayment: Number(minimumPayment.value)
        }
    } else if (accountType.value === "loan") {
        accountDetails = {
            apr: Number(loanApr.value),
            scheduledPayment: Number(scheduledPayment.value),
            nextDueDate: nextDueDate.value,
            paymentFrequency: paymentFrequency.value
        }
    }

    const accountData = {
        name: accountName.value,
        type: accountType.value,
        openingBalance: Number(accountBalance.value),
        details: accountDetails
    }

    console.log(accountData)
    return

    try {
        const savedAccount = await createAccount(accountData)

        accounts.push({
            id: savedAccount.id,
            name: savedAccount.name,
            type: savedAccount.type,
            balance: Number(savedAccount.opening_balance)
        })

        renderAccounts()

        accountForm.reset()
        accountModal.close()
    } catch (error) {
        console.error("Account could not be saved:", error)
    }
})

accountType.addEventListener("change", () => {
    creditCardFields.classList.add("hidden")
    loanFields.classList.add("hidden")

    if (accountType.value === "credit_card") {
        creditCardFields.classList.remove("hidden")
    } else if (accountType.value === "loan") {
        loanFields.classList.remove("hidden")
    }
})

const formatCurrency = (amount) => {
    return amount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD"
    })
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

    return accountTypeLabels[type] || type
}

const renderAccounts = () => {
    accountContainer.innerHTML = ""

    if (accounts.length === 0) {
        accountContainer.innerHTML = `
            <div class="card bg-base-100 border border-base-300 shadow-sm">
                <div class="card-body">
                    <p class="text-base-content/70">
                        No accounts to display.
                    </p>
                </div>
            </div>
        `

        return
    }

    accounts.forEach((account) => {
        accountContainer.innerHTML += `
            <div class="card bg-base-100 border border-base-300 shadow-sm">
                <div class="card-body">
                    <h2 class="card-title">${account.name}</h2>

                    <p class="text-sm opacity-70">
                        ${formatAccountType(account.type)}
                    </p>

                    <p class="text-2xl font-bold">
                        ${formatCurrency(account.balance)}
                    </p>
                </div>
            </div>
        `
    })
}

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

        renderAccounts()
    } catch (error) {
        console.error("Accounts could not be loaded:", error)
    }
}

loadAccounts()