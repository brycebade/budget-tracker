import { renderLayout } from "./components/layout.js"
import { getBills, createBill } from "./api/billsApi.js"
import { getAccounts } from "./api/accountsApi.js"
import { renderBillModal } from "./billModal.js"

renderLayout({
    title: "Bills",
    activePage: "bills",
    actionLabel: "Add New Bill +"
})

const actionButton = document.getElementById("pageActionButton")
const billsContainer = document.getElementById("billsContainer")

const bills = []
const accounts = []

const openBillModal = () => {
    const modal = renderBillModal()

    const cancelButton = document.getElementById("cancelBillButton")
    const fundingAccountSelect = document.getElementById("billFundingAccount")
    const linkedAccountSelect = document.getElementById("billLinkedAccount")

    accounts.forEach((account) => {
        if (
            account.type === "checking" ||
            account.type === "savings"
        ) {
            fundingAccountSelect.innerHTML += `
                <option value="${account.id}">
                    ${account.name}
                </option>
            `
        }

        if (
            account.type === "credit_card" ||
            account.type === "loan"
        ) {
            linkedAccountSelect.innerHTML += `
                <option value="${account.id}">
                    ${account.name}
                </option>
            `
        }
    })

    cancelButton.addEventListener("click", () => {
        modal.close()
    })

    modal.showModal()
}

actionButton.addEventListener("click", () => {
    openBillModal()
})

const loadBills = async () => {
    try {
        const [savedBills, savedAccounts] = await Promise.all([
            getBills(),
            getAccounts()
        ])

        bills.push(...savedBills)
        accounts.push(...savedAccounts)

        console.log(bills)

    } catch (error) {
        console.error("Bills could not be loaded:", error)
    }
}

loadBills()