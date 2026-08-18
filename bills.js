import { renderLayout } from "./components/layout.js"
import { getBills, createBill } from "./api/billsApi.js"
import { getAccounts } from "./api/accountsApi.js"
import { renderBillModal } from "./billModal.js"
import { getNextBillDueDate } from "./utils/billCalculations.js"
import { getBillPayments } from "./api/billPaymentsApi.js"

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

const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    })
}

const formatDateKey = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
}

const actionButton = document.getElementById("pageActionButton")
const billsContainer = document.getElementById("billsContainer")

const bills = []
const accounts = []
const billPayments = []

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
    const plannedPaymentInput = document.getElementById("billPlannedPayment")
    const frequencySelect = document.getElementById("billFrequency")
    const dueDayField = document.getElementById("dueDayField")
    const anchorDateField = document.getElementById("anchorDateField")
    const anchorDateInput = document.getElementById("billAnchorDate")

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

    frequencySelect.addEventListener("change", () => {
        const isMonthly = frequencySelect.value === "monthly"

        if (isMonthly) {
            dueDayField.hidden = false
            anchorDateField.hidden = true

            dueDayInput.required = true
            anchorDateInput.required = false
        } else {
            dueDayField.hidden = true
            anchorDateField.hidden = false

            dueDayInput.required = false
            anchorDateInput.required = true
        }
    })

    form.addEventListener("submit", async (event) => {
        event.preventDefault()

        const isMonthly = frequencySelect.value === "monthly"

        const billData = {
            name: nameInput.value,
            category: categoryInput.value,
            expectedAmount: numberOrNull(expectedAmountInput),
            minimumPayment: numberOrNull(minimumPaymentInput),
            plannedPayment: numberOrNull(plannedPaymentInput),
            dueDay: isMonthly ? Number(dueDayInput.value) : null,
            frequency: frequencySelect.value,
            anchorDate: isMonthly ? null : anchorDateInput.value,
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
        const [savedBills, savedAccounts, savedBillPayments] = await Promise.all([
            getBills(),
            getAccounts(),
            getBillPayments()
        ])

        bills.push(...savedBills)
        accounts.push(...savedAccounts)
        billPayments.push(...savedBillPayments)

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

        const nextDueDate = getNextBillDueDate(bill)
        const dueDateKey = formatDateKey(nextDueDate)

        const paymentsForCurrentBill = billPayments.filter((payment) => {
            return (
                payment.bill_id === bill.id &&
                payment.due_date === dueDateKey
            )
        })

        console.log(bill.name, paymentsForCurrentBill)

        const dueText = bill.frequency === "monthly"
            ? `Due Day ${bill.due_day}`
            : `First Due Date ${bill.anchor_date?.split("T")[0]}`

        const displayAmount = 
            bill.planned_payment ??
            bill.expected_amount ??
            bill.minimum_payment

        const extraPayment = 
            bill.minimum_payment != null &&
            bill.planned_payment != null
                ? bill.planned_payment - bill.minimum_payment
                : null

        billsContainer.innerHTML += `
            <div class="card bg-base-100 border border-base-300">
                <div class="card-body">
                    <h2 class="card-title">
                        ${bill.name}
                    </h2>

                    <p class="text-sm text-base-content/60">
                        ${bill.category}
                    </p>

                    <p class="text-sm text-base-content/60">
                        Planned Payment
                    </p>

                    <p class="text-2xl font-bold">
                        ${formatCurrency(displayAmount)}
                    </p>

                    <p class="text-sm text-base-content/70">
                        Next Due: ${formatDate(nextDueDate)}
                    </p>

                    <p class="text-sm capitalize text-base-content/70">
                        Frequency: ${bill.frequency}
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

                    ${
                        extraPayment > 0
                            ? `
                                <p class="text-sm text-base-content/70">
                                    Extra Payment:
                                    <span class="font-medium text-success">
                                        ${formatCurrency(extraPayment)}
                                    </span>
                                </p>
                            `
                            : ""
                    }

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