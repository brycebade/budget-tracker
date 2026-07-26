import { renderLayout } from "./components/layout.js"
import { renderTransactionModal } from "./transactionModal.js"
import { getAccounts } from "./api/accountsApi.js"

renderLayout({
    title: "Transactions",
    activePage: "transactions",
    actionLabel: "Add Transaction +"
})

const transactionModal = renderTransactionModal()

const actionButton = document.getElementById("pageActionButton")
const cancelTransactionButton = document.getElementById("cancelTransactionButton")

actionButton.addEventListener("click", () => {
    transactionModal.showModal()
})

cancelTransactionButton.addEventListener("click", () => {
    transactionModal.close()
})

const loadAccountOptions = async () => {
    try {
        const accounts = await getAccounts()

        accounts.forEach((account) => {
            transactionAccount.innerHTML += `
                <option value="${}">
                    ${}
                </option>
            `
        })
    } catch (error) {
        console.error("Account options could not be loaded:", error)
    }
}

loadAccountOptions()