import { renderLayout } from "./components/layout.js"
import { renderTransactionModal } from "./transactionModal.js"

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