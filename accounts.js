import { renderLayout } from "./components/layout.js"
import { renderAccountModal } from "./accountModal.js"
import { createAccount, getAccounts, updateAccount, deleteAccount } from "./api/accountsApi.js"

renderLayout({
    title: "Accounts",
    activePage: "accounts",
    actionLabel: "Add Account +"
})

const actionButton = document.getElementById("pageActionButton")
const accountContainer = document.getElementById("accountContainer")

const accounts = []

const openAccountModal = (account = null) => {
    const modal = renderAccountModal(account)
    const cancelButton = document.getElementById("cancelAccountButton")
    const accountTypeSelect = document.getElementById("accountType")
    const creditFields = document.getElementById("creditCardFields")
    const loanFields = document.getElementById("loanFields")
    const accountNameInput = document.getElementById("accountName")
    const accountBalanceInput = document.getElementById("accountBalance")
    const accountAprInput = document.getElementById("accountApr")
    const creditLimitInput = document.getElementById("creditLimit")
    const statementClosingDateInput = document.getElementById("statementClosingDate")
    const paymentDueDateInput = document.getElementById("paymentDueDate")
    const minimumPaymentInput = document.getElementById("minimumPayment")
    const loanAprInput = document.getElementById("loanApr")
    const scheduledPaymentInput = document.getElementById("scheduledPayment")
    const loanDueDayInput = document.getElementById("loanDueDay")
    const paymentFrequencyInput = document.getElementById("paymentFrequency")
    const form = document.getElementById("accountForm")
    

    const updateAccountTypeFields = () => {
        creditFields.classList.add("hidden")
        loanFields.classList.add("hidden")

        if (accountTypeSelect.value === "credit_card") {
            creditFields.classList.remove("hidden")
        } else if (accountTypeSelect.value === "loan") {
            loanFields.classList.remove("hidden")
        }
    }

    cancelButton.addEventListener("click", () => {
        modal.close()
    })

    const numberOrNull = (input) => {
        return input.value === ""
            ? null
            : Number(input.value)
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault()

        let accountDetails = null

        if (accountTypeSelect.value === "credit_card") {
            accountDetails = {
                apr: numberOrNull(accountAprInput),
                creditLimit: numberOrNull(creditLimitInput),
                statementClosingDate: numberOrNull(statementClosingDateInput),
                dueDay: numberOrNull(paymentDueDateInput),
                minimumPayment: numberOrNull(minimumPaymentInput),
            }
        } else if (accountTypeSelect.value === "loan") {
            accountDetails = {
                apr: numberOrNull(loanAprInput),
                scheduledPayment: numberOrNull(scheduledPaymentInput),
                dueDay: numberOrNull(loanDueDayInput),
                paymentFrequency: paymentFrequencyInput.value
            }
        }

        const accountData = {
            name: accountNameInput.value,
            type: accountTypeSelect.value,
            openingBalance: Number(accountBalanceInput.value),
            details: accountDetails
        }

        if (account) {
            const result = await updateAccount(account.id, accountData)
            const accountIndex = accounts.findIndex((item) => {
                return item.id === account.id
            })

            accounts[accountIndex] = {
                id: result.id,
                name: result.name,
                type: result.type,
                balance: Number(result.opening_balance),
                details: result.details
            }

            renderAccounts()
            modal.close()
        } else {
           const savedAccount = await createAccount(accountData)

        accounts.push({
            id: savedAccount.id,
            name: savedAccount.name,
            type: savedAccount.type,
            balance: Number(savedAccount.opening_balance),
            details: savedAccount.details
        })

        renderAccounts()
        modal.close()
    }
})

    accountTypeSelect.addEventListener("change", () => {
        updateAccountTypeFields()       
    })

    if (account) {
        accountNameInput.value = account.name
        accountTypeSelect.value = account.type
        updateAccountTypeFields()
        accountBalanceInput.value = account.balance
    
        if (account.type === "credit_card" && account.details) {
            accountAprInput.value = account.details.apr
            statementClosingDateInput.value = account.details.statementClosingDate
            paymentDueDateInput.value = account.details.dueDay
            minimumPaymentInput.value = account.details.minimumPayment
            creditLimitInput.value = account.details.creditLimit
        }

        if (account.type === "loan" && account.details) {
            loanAprInput.value = account.details.apr
            scheduledPaymentInput.value = account.details.scheduledPayment
            loanDueDayInput.value = account.details.dueDay
            paymentFrequencyInput.value = account.details.paymentFrequency
        }
    }

    modal.showModal()
}

actionButton.addEventListener("click", () => {
    openAccountModal()
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

const calculateAvailableCredit = (account) => {
    const creditLimit = account.details?.creditLimit

    if (creditLimit === null || creditLimit === undefined) {
        return null
    }

    return creditLimit - account.balance
}

const calculateCreditUtilization = (account) => {
    const creditLimit = account.details?.creditLimit

    if (creditLimit == null || creditLimit === 0) {
        return null
    }

    return (account.balance / creditLimit) * 100
}

const renderAccountDetails = (account) => {
    const details = account.details
    
    if (!details) return ""

    if (account.type === "credit_card") {
        const availableCredit = calculateAvailableCredit(account)

        return `
            <div class="divider my-2"></div>

            <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">

                <dt class="text-base-content/60">Credit Limit</dt>
                <dd class="text-right">
                    ${
                        details.creditLimit == null
                            ? "Not set"
                            : formatCurrency(details.creditLimit)
                    }
                </dd>

                <dt class="text-base-content/60">Available Credit</dt>
                <dd class="text-right">
                    ${
                        availableCredit === null
                            ? "Not Set"
                            : formatCurrency(availableCredit)
                    }
                </dd>

                <dt class="text-base-content/60">Purchase APR</dt>
                <dd class="text-right">
                    ${details.apr ?? "Not set"}%
                </dd>

                <dt class="text-base-content/60">Statement Closes</dt>
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
            <div class="divider my-2"></div>

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

                <dt class="text-base-content/60">Payment Due</dt>
                <dd class="text-right">
                    Day ${details.dueDay ?? "Not set"}
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
                        <button
                            class="btn btn-sm btn-error btn-outline delete-account-btn"
                            data-account-id="${account.id}"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `
    })
    addEditButtonListeners()
    addDeleteButtonListeners()
}

const addEditButtonListeners = () => {
    const editButtons = document.querySelectorAll(".edit-account-btn")

    editButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const accountId = button.dataset.accountId
            
            const selectedAccount = accounts.find((account) => {
                return account.id === accountId
            })

            openAccountModal(selectedAccount)
        })
    })
}

const addDeleteButtonListeners = () => {
    const deleteButtons = document.querySelectorAll(".delete-account-btn")

    deleteButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const accountId = button.dataset.accountId
            
            const selectedAccount = accounts.find((account) => {
                return account.id === accountId
            })

            const confirmed = window.confirm(
                `Delete ${selectedAccount.name}?`
            )

            if (!confirmed) {
                return
            }

            await deleteAccount(selectedAccount.id)

            const accountIndex = accounts.findIndex((item) => {
                return item.id === selectedAccount.id
            })

            accounts.splice(accountIndex, 1)

            renderAccounts()
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