import { renderLayout } from "./components/layout.js"
import { getBills, createBill } from "./api/billsApi.js"
import { getAccounts } from "./api/accountsApi.js"
import { renderBillModal } from "./billModal.js"

renderLayout({
    title: "Bills",
    activePage: "bills",
    actionLabel: "Add New Bill +"
})

const formatCurrency = (amount) => {
    return amount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD"
    })
}

const actionButton = document.getElementById("pageActionButton")
const billsContainer = document.getElementById("billsContainer")

const bills = []
const accounts = []

const openBillModal = () => {
    const modal = renderBillModal()

    const cancelButton = document.getElementById("cancelBillButton")
    const fundingAccountSelect = document.getElementById("billFundingAccount")
    const linkedAccountSelect = document.getElementById("billLinkedAccount")
    const form = document.getElementById("billForm")
    const nameInput = document.getElementById("billName")
    const categoryInput = document.getElementById("billCategory")
    const expectedAmountInput = document.getElementById("billExpectedAmount")
    const minimumPaymentInput = document.getElementById("billMinimumPayment")
    const dueDayInput = document.getElementById("billDueDay")

    const numberOrNull = (input) => {
        return input.value === ""
        ? null
        : Number(input.value)
    }

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

    form.addEventListener("submit", async (event) => {
        event.preventDefault()

        const billData = {
            name: nameInput.value,
            category: categoryInput.value,
            expectedAmount: Number(expectedAmountInput.value),
            minimumPayment: numberOrNull(minimumPaymentInput),
            dueDay: Number(dueDayInput.value),
            fundingAccountId: fundingAccountSelect.value || null,
            linkedAccountId: linkedAccountSelect.value || null
        }

        try {
            const savedBill = await createBill(billData)
            
            bills.push(savedBill)

            renderBills()

            modal.close()
        } catch (error) {
            console.error("Bill could not be saved:", error)
        }

        
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

        console.log(savedBills)

        bills.push(...savedBills)
        accounts.push(...savedAccounts)

        renderBills()

    } catch (error) {
        console.error("Bills could not be loaded:", error)
    }
}

const renderBills = () => {
    billsContainer.innerHTML = ""

    if (bills.length === 0) {
        billsContainer.innerHTML = `
            <div class="card bg-base-100 border border-base-300">
                <div class="card-body">
                    <p class="text-base-content/60">
                        No bills to display.
                    </p>
                </div>
            </div>
        `

        return
    }

    bills.forEach((bill) => {
        const fundingAccount = accounts.find((account) => {
            return account.id === bill.funding_account_id
        })

        const linkedAccount = accounts.find((account) => {
            return account.id === bill.linked_account_id
        })

        billsContainer.innerHTML += `
            <div class="card bg-base-100 border border-base-300">
                <div class="card-body">
                    <h2 class="card-title">
                        ${bill.name}
                    </h2>

                    <p class="text-sm text-base-content/60">
                        ${bill.category}
                    </p>

                    <p class="text-2xl font-bold">
                        ${formatCurrency(bill.expected_amount)}
                    </p>

                    <p class="text-sm text-base-content/70">
                        Due Day ${bill.due_day}
                    </p>

                    <p class="text-sm text-base-content/70">
                        Minimum Payment:
                        <span class="font-medium text-base-content">
                            ${
                                bill.minimum_payment == null    
                                    ? "Not set"
                                    : formatCurrency(bill.minimum_payment)
                            }
                        </span>
                    </p>

                    <p class="text-sm text-base-content/70">
                        Paid From:
                        <span class="font-medium text-base-content">
                            ${fundingAccount?.name || "Not set"}
                        </span>
                    </p>

                    <p class="text-sm text-base-content/70">
                        Linked Account:
                        <span class="font-medium text-base-content">
                            ${linkedAccount?.name || "None"}
                        </span>
                    </p>      
                </div>
            </div>
        `
    })
}

loadBills()