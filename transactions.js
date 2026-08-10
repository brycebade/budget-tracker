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
const transactionAccount = document.getElementById("transactionAccount")
const transactionAccountFilter = document.getElementById("transactionAccountFilter")

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

            transactionAccountFilter.innerHTML += `
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

const getTransactionBalanceChange = (account, transaction) => {
    if (
        account.type === "checking" ||
        account.type === "savings"
    ) {
        if (
            transaction.type === "income" ||
            transaction.type === "transfer_in" ||
            transaction.type === "refund"
        ) {
            return transaction.amount
        }

        if (
            transaction.type === "expense" ||
            transaction.type === "transfer_out" ||
            transaction.type === "payment" ||
            transaction.type === "fee"
        ) {
            return -transaction.amount
        }
    }

    if (account.type === "credit_card") {
        if (
            transaction.type === "expense" ||
            transaction.type === "interest" ||
            transaction.type === "fee"
        ) {
            return transaction.amount
        }

        if (
            transaction.type === "payment" ||
            transaction.type === "refund"
        ) {
            return -transaction.amount
        }
    }

    if (account.type === "loan") {
        if (
            transaction.type === "interest" ||
            transaction.type === "fee"
        ) {
            return transaction.amount
        }

        if (transaction.type === "payment") {
            return -transaction.amount
        }
    }

    return 0
}

const renderTransactions = () => {
    transactionContainer.innerHTML = ""
    transactionContainer.className = "overflow-hidden rounded-box border border-base-300 bg-base-100"

    const selectedAccountId = transactionAccountFilter.value

    if (!selectedAccountId) {
        transactionContainer.innerHTML = `
            <div class="card bg-base-100 border border-base-300 shadow-md">
                <div class="card-body">
                    <p class="text-base-content/70">
                        Select an account to view its transactions.
                    </p>
                </div>
            </div>
        `

        return
    }

    const filteredTransactions = transactions.filter((transaction) => {
        return transaction.accountId === selectedAccountId
    })

    if (filteredTransactions.length === 0) {
        transactionContainer.innerHTML = `
            <div class="card bg-base-100 border border-base-300 shadow-md">
                <div class="card-body">
                    <p class="text-base-content/70">
                        No Transactions to Display
                    </p>
                </div>
            </div>
        `

        return
    }

    transactionContainer.innerHTML = `
        <div class="grid grid-cols-[1fr_160px_120px_120px] gap-4 bg-base-200/60 px-4 py-2 text-sm font-semibold text-base-content/60">
            <span>Description</span>
            <span>Category</span>
            <span>Date</span>
            <span class="text-right">Amount</span>
        </div>
    `

    filteredTransactions.forEach((transaction) => {
        const isExpense = transaction.type === "expense"
        const amountPrefix = isExpense ? "-" : "+"

        const amountClass = isExpense
            ? "text-error" 
            : "text-success"

        transactionContainer.innerHTML += `
            <div class="grid grid-cols-[1fr_160px_120px_120px] gap-4 items-center border-t border-base-300 px-4 py-4 hover:bg-base-200/40">
                <span class="font-medium truncate">
                    ${transaction.description}
                </span>
            
                <span class="text-sm text-base-content/70">
                    ${transaction.category}
                </span>

                <span class="text-sm text-base-content/70">
                    ${transaction.date}
                </span>

                <span class="text-right font-semibold tabular-nums ${amountClass}">
                    ${amountPrefix}$${transaction.amount.toFixed(2)}
                </span>
            </div>
        `
    })
}

transactionAccountFilter.addEventListener("change", () => {
    renderTransactions()
})

transactionAccount.addEventListener("change", () => {
    const selectedAccount = accounts.find((account) => {
        return account.id === transactionAccount.value
    })

    transactionType.innerHTML = `
        <option value= "" disabled selected>
            Select Type
        </option>
    `

    if (!selectedAccount) {
        return
    }
    
    if (selectedAccount.type === "credit_card") {
        transactionType.innerHTML += `
            <option value="expense">Purchase / Expense</option>
            <option value="payment">Payment</option>
            <option value="refund">Refund</option>
            <option value="interest">Interest</option>
            <option value="fee">Fee</option>
        `
    }

    if (
        selectedAccount.type === "checking" || 
        selectedAccount.type === "savings"
    ) {
        transactionType.innerHTML += `
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer_in">Transfer In</option>
            <option value="transfer_out">Transfer Out</option>
            <option value="payment">Payment</option>
            <option value="refund">Refund</option>
            <option value="fee">Fee</option>
        `
    }

    if (selectedAccount.type === "loan") {
        transactionType.innerHTML += `
            <option value="payment">Payment</option>
            <option value="interest">Interest</option>
            <option value="fee">Fee</option>
        `
    }
})

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