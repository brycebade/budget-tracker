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

const formatDate = (dateString) => {
    if (!dateString) return "Not set"

    const [year, month, day] = dateString
        .split("-")
        .map(Number)

    const date = new Date(year, month -1, day)

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    })
}

const renderAccountDetails = (account) => {
    const details = account.details
    
    if (!details) return ""

    if (account.type === "credit_card") {
        return `
            <div class="divider my-2"></div>

            <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt class="text-base-content/60">Purchase APR</dt>
                <dd class="text-right">
                    ${details.apr ?? "Not set"}%
                </dd>

                <dt class=text-base-content/60">Statement Closes</dt>
                <dd class="text-right">
                    Day ${details.statementClosingDate ?? "Not set"}
                </dd>

                <dt class="text-base-content/60">Payment Due</dt>
                <dd class="text-right">
                    Day ${details.dueDay ?? "Not set"}
                </dd>

                <dt class="text-base-content/60">Minimum Payment</dt>
                <dd class="text-right">
                    ${
                        details.minimumPayment === null
                            ? "Not set"
                            : formatCurrency(details.minimumPayment)
                    }
                </dd>
            </dl>
        `
    }

    if (account.type === "loan") {
        return `
            <div class=divider my-2"></div>

            <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt class="text-base-content/60">APR</dt>
                <dd class="text-right">
                    ${details.apr ?? "Not set"}
                </dd>

                <dt class="text-base-content/60">Scheduled Payment</dt>
                <dd class="text-right">
                    ${
                        details.scheduledPayment === null
                            ? "Not set"
                            : formatCurrency(details.scheduledPayment)
                    }
                </dd>

                <dt class="text-base-content/60">Next Due Date</dt>
                <dd class="text-right"
                    ${formatDate(details.nextDueDate)}
                </dd>

                <dt class="text-base-content/60">Frequency</dt>
                <dd class="text-right capitalize">
                    ${details.paymentFrequency ?? "Not set"}
                </dd>
            </dl>
        `
    }

    return ""
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
            <div class="card bg-base-100 border border-base-300">
                <div class="card-body">
                    <h2 class="card-title">${account.name}</h2>

                    <p>${formatAccountType(account.type)}
                    </p>

                    <p class="text-2xl font-bold">
                        ${formatCurrency(account.balance)}
                    </p>

                    ${renderAccountDetails(account)}
                

                    <div class="card-actions justify-end">
                        <button
                            class="btn btn-sm btn-outline edit-account-btn"
                            data-account-id="${account.id}"
                        >
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        `
    })
    addEditButtonListeners()
}

const addEditButtonListeners = () => {
    const editButtons = document.querySelectorAll(".edit-account-btn")

    editButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const accountId = button.dataset.accountId
            
            const selectedAccount = accounts.find((account) => {
                return account.id === accountId
            })

            console.log(selectedAccount.name)
        })
    })
}

const loadAccounts = async () => {
    try {
        const savedAccounts = await getAccounts()

        const formattedAccounts = savedAccounts.map((account) => ({
            id: account.id,
            name: account.name,
            type: account.type,
            balance: Number(account.opening_balance),
            details: account.details
        }))

        accounts.push(...formattedAccounts)

        renderAccounts()
    } catch (error) {
        console.error("Accounts could not be loaded:", error)
    }
}

loadAccounts()