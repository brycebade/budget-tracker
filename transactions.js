import { renderLayout } from "./components/layout.js"
import { renderTransactionModal } from "./transactionModal.js"
import { getAccounts } from "./api/accountsApi.js"
import { createTransaction, getTransactions } from "./api/transactionsApi.js"

renderLayout({
    title: "Transactions",
    activePage: "transactions",
    actionLabel: "Add Transaction +"
})

const transactionModal = renderTransactionModal()

const actionButton = document.getElementById("pageActionButton")
const cancelTransactionButton = document.getElementById("cancelTransactionButton")
const transactionForm = document.getElementById("transactionForm")
const transactionDescription = document.getElementById("transactionDescription")
const transactionAmount = document.getElementById("transactionAmount")
const transactionType = document.getElementById("transactionType")
const transactionCategory = document.getElementById("transactionCategory")
const transactionDate = document.getElementById("transactionDate")
const transactionContainer = document.getElementById("transactionContainer")

const transactions = []
const accounts = []

actionButton.addEventListener("click", () => {
    transactionModal.showModal()
})

cancelTransactionButton.addEventListener("click", () => {
    transactionModal.close()
})

const loadAccountOptions = async () => {
    try {
        const savedAccounts = await getAccounts()

        accounts.push(...savedAccounts)

        savedAccounts.forEach((account) => {
            transactionAccount.innerHTML += `
                <option value="${account.id}">
                    ${account.name}
                </option>
            `
        })
    } catch (error) {
        console.error("Account options could not be loaded:", error)
    }
}

const loadTransactions = async () => {
    try {
        const savedTransactions = await getTransactions()

        const formattedTransactions = savedTransactions.map(
            (transaction) => ({
                id: transaction.id,
                accountId: transaction.account_id,
                description: transaction.description,
                amount: Number(transaction.amount),
                type: transaction.type,
                category: transaction.category,
                date: transaction.transaction_date
            })
        )

        transactions.push(...formattedTransactions)

        renderTransactions()
    } catch (error) {
        console.error("Transactions could not be loaded:", error)
    }
}

const renderTransactions = () => {
    transactionContainer.innerHTML = ""
    transactionContainer.className = "space-y-2"

    if (transactions.length === 0) {
        transactionContainer.innerHTML = `
            <div class="card bg-base-100 border border-base-300 shadow-md">
                <div class="card-body">
                    <p class="text-base-content/70">
                        No transactions to display.
                    </p>
                </div>
            </div>
        `

        return
    }

    transactions.forEach((transaction) => {
        const account = accounts.find((account) => {
            return account.id === transaction.accountId
        })

        const isExpense = transaction.type === "expense"
        const amountPrefix = isExpense ? "-" : "+"

        const amountClass = isExpense
            ? "text-error" 
            : "text-success"

        transactionContainer.innerHTML += `
            <div class="rounded-box border border-base-300 bg-base-100 shadow-md">
                <div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4">
                    <div class="min-w-0">
                        <div class="flex items-center gap-2">
                            <h3 class="truncate font-semibold">
                                ${transaction.description}
                            </h3>

                            <span class="badge badge-ghost badge-sm">
                                ${transaction.category}
                            </span>
                        </div>

                        <p class="mt-1 text-sm text-base-content/60">
                            ${account?.name || "Unknwon Account"} · ${transaction.date}
                        </p>
                    </div>

                    <p class="text-lg font-bold tabular-nums ${amountClass}">
                        ${amountPrefix}$${transaction.amount.toFixed(2)}
                    </p>
                </div>
            </div>
        `
    })
}

transactionForm.addEventListener("submit", async (event) => {
    event.preventDefault()

    const transactionData = {
       accountId: transactionAccount.value,
       description: transactionDescription.value,
       amount: Number(transactionAmount.value),
       type: transactionType.value,
       category: transactionCategory.value,
       date: transactionDate.value
    }

    try {
        const savedTransaction = await createTransaction(transactionData)

        transactions.push({
            id: savedTransaction.id,
            accountId: savedTransaction.account_id,
            description: savedTransaction.description,
            amount: savedTransaction.amount,
            type: savedTransaction.type,
            category: savedTransaction.category,
            date: savedTransaction.transaction_date
        })

        renderTransactions()

        transactionForm.reset()
        transactionModal.close()
    } catch (error) {
        console.error("Transaction could not be saved", error)
    }
})

const initializeTransactionPage = async () => {
    await loadAccountOptions()
    await loadTransactions()
}

initializeTransactionPage()