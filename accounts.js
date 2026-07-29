import { renderLayout } from "./components/layout.js"
import { renderAccountModal } from "./accountModal.js"

renderLayout({
    title: "Accounts",
    activePage: "accounts",
    actionLabel: "Add Account +"
})

const accountModal = renderAccountModal()
const actionButton = document.getElementById("pageActionButton")
const cancelAccountButton = document.getElementById("cancelAccountButton")

actionButton.addEventListener("click", () => {
    accountModal.showModal()
})

cancelAccountButton.addEventListener("click", () => {
    accountModal.close()
})