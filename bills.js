import { renderLayout } from "./components/layout.js"
import { renderAccountModal } from "./accountModal.js"

renderLayout({
    title: "Bills",
    activePage: "bills",
    actionLabel: "Add New Bill +"
})