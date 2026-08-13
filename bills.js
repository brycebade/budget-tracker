import { renderLayout } from "./components/layout.js"
import { getBills } from "./api/billsApi.js"

renderLayout({
    title: "Bills",
    activePage: "bills",
    actionLabel: "Add New Bill +"
})

const loadBills = async () => {
    try {
        const savedBills = await getBills()

        console.log(savedBills)
    } catch (error) {
        console.error("Bills could not be loaded:", error)
    }
}

loadBills()