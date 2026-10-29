import { renderLayout } from "./components/layout.js"
import { 
    getBills, 
    createBill, 
    updateBill,
    deactivateBill,
    reactivateBill
} from "./api/billsApi.js"
import { getAccounts } from "./api/accountsApi.js"
import { renderBillModal } from "./billModal.js"
import {
    getNextBillDueDate,
    getPreviousBillDueDate,
    getCurrentMonthBillDueDate,
    getFollowingBillDueDate,
    getBillDueDatesBetween
} from "./utils/billCalculations.js"
import { getBillPayments, createBillPayment } from "./api/billPaymentsApi.js"
import { renderBillPaymentModal } from "./billPaymentsModal.js"

renderLayout({
    title: "Bills",
    activePage: "bills",
    actionLabel: "Add New Bill +",
})

const formatCurrency = (amount) => {
    return amount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
    })
}

const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
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
const inactiveBillsButton = document.getElementById("inactiveBillsButton")

let showingInactiveBills = false

const bills = []
const accounts = []
const billPayments = []
const PENDING_BILL_PAYMENT_KEY = "lumicairn-pending-bill-payment"

const getStoredPendingPayment = () => {
    try {
        const savedPayment = localStorage.getItem(PENDING_BILL_PAYMENT_KEY)

        if (!savedPayment) {
            return null
        }

        return JSON.parse(savedPayment)
    } catch (error) {
        console.error("Could not read pending bill payment:", error)
        return null
    }
}

inactiveBillsButton.addEventListener("click", () => {
    showingInactiveBills = !showingInactiveBills

    inactiveBillsButton.textContent = 
        showingInactiveBills
            ? "View Active Bills"
            : "View Inactive Bills"

    renderBills()
})

const openBillModal = (bill = null) => {
    const modal = renderBillModal(bill)

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

    const updateFrequencyFields = () => {
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
    }

    if (bill) {
        nameInput.value = bill.name
        categoryInput.value = bill.category
        expectedAmountInput.value = bill.expected_amount ?? ""
        minimumPaymentInput.value = bill.minimum_payment ?? ""
        plannedPaymentInput.value = bill.planned_payment ?? ""
        frequencySelect.value = bill.frequency
        dueDayInput.value = bill.due_day ?? ""
        anchorDateInput.value = bill.anchor_date
            ? bill.anchor_date.split("T")[0] : ""
    }

    updateFrequencyFields()

    const numberOrNull = (input) => {
        return input.value === "" ? null : Number(input.value)
    }

    accounts.forEach((account) => {
        if (account.type === "checking" || account.type === "savings") {
            fundingAccountSelect.innerHTML += `
                <option value="${account.id}">
                    ${account.name}
                </option>
            `
        }

        if (account.type === "credit_card" || account.type === "loan") {
            linkedAccountSelect.innerHTML += `
                <option value="${account.id}">
                    ${account.name}
                </option>
            `
        }

    if (bill) {
        fundingAccountSelect.value = bill.funding_account_id ?? ""
        linkedAccountSelect.value = bill.linked_account_id ?? ""
    }

    })

    cancelButton.addEventListener("click", () => {
        modal.close()
    })

    frequencySelect.addEventListener("change", updateFrequencyFields)

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
            linkedAccountId: linkedAccountSelect.value || null,
        }

        try {
            let savedBill

            if (bill) {
                savedBill = await updateBill(bill.id, billData)

                const billIndex = bills.findIndex((existingBill) => {
                    return existingBill.id === bill.id
                })

                bills[billIndex] = savedBill
            } else {
                savedBill = await createBill(billData)

                bills.push(savedBill)
            }

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
        const [savedBills, savedAccounts, savedBillPayments] =
            await Promise.all([getBills(), getAccounts(), getBillPayments()])

        bills.push(...savedBills)
        accounts.push(...savedAccounts)
        billPayments.push(...savedBillPayments)

        renderBills()
    } catch (error) {
        console.error("Bills could not be loaded:", error)
    }
}

const getBillState = (bill) => {
    const plannedAmount =
        bill.planned_payment ??
        bill.expected_amount ??
        bill.minimum_payment ??
        0

    const previousDueDate = getPreviousBillDueDate(bill)
    const nextDueDate = getNextBillDueDate(bill)
    const currentMonthDueDate = getCurrentMonthBillDueDate(bill)

    const trackingStartDate = new Date(bill.created_at)

    trackingStartDate.setHours(0, 0, 0, 0)

    const shouldCheckPreviousOccurrence = 
        previousDueDate !== null &&
        previousDueDate >= trackingStartDate

    const previousDueDateKey = previousDueDate
        ? formatDateKey(previousDueDate)
        : null

    const paymentsForBill = billPayments.filter((payment) => {
        return payment.bill_id === bill.id
    })

    const dueDates = bill.frequency === "monthly"
        ? getBillDueDatesBetween(bill, trackingStartDate, currentMonthDueDate) : []

    const occurrences = dueDates.map((dueDate) => {
        const dueDateKey = formatDateKey(dueDate)

        const paymentsForOccurrence = paymentsForBill.filter((payment) => {
            return payment.due_date === dueDateKey
        })

        const paidSoFar = paymentsForOccurrence.reduce((total, payment) => {
            return total + payment.amount
        }, 0)

        const remainingAmount = Math.max(plannedAmount - paidSoFar, 0)

        return {
            dueDate,
            dueDateKey,
            paidSoFar,
            remainingAmount
        }
    })

    const oldestUnpaidOccurrence = occurrences.find((occurrence) => {
        return occurrence.remainingAmount > 0
    })

    const pastDueAmount = occurrences.filter((occurrence) => {
        return occurrence.dueDate < currentMonthDueDate
    })
        .reduce((total, occurrence) => {
            return total + occurrence.remainingAmount
    }, 0)

    const hasPastDue = pastDueAmount > 0

    const currentDueDateKey = currentMonthDueDate ? formatDateKey(currentMonthDueDate) : null

    const currentOccurrence = currentDueDateKey ? occurrences.find((occurrence) => {
        return occurrence.dueDateKey === currentDueDateKey
    })
    : null

    const currentDueAmount = currentOccurrence ? currentOccurrence.remainingAmount : 0

    const totalDueAmount = pastDueAmount + currentDueAmount
    
    const paymentGroups = []

    paymentsForBill.forEach((payment) => {
        const existingGroup = paymentGroups.find((group) => {
            return group.payment_group_id === payment.payment_group_id
        })

        if (existingGroup) {
            existingGroup.amount += payment.amount
        } else {
            paymentGroups.push({
                payment_group_id: payment.payment_group_id,
                payment_date: payment.payment_date,
                amount: payment.amount,
                created_at: payment.created_at
            })
        }
    })

    const lastPayment = paymentGroups.reduce(
        (latestPayment, paymentGroup) => {
            if (latestPayment === null) {
                return paymentGroup
        }

        if (
            paymentGroup.payment_date > latestPayment.payment_date ||
            (
                paymentGroup.payment_date === latestPayment.payment_date &&
                paymentGroup.created_at > latestPayment.created_at
            )
        ) {
            return paymentGroup
        }
            return latestPayment
        }, 
        null
    )

    const paymentsForPreviousBill = billPayments.filter((payment) => {
        return (
            payment.bill_id === bill.id &&
            payment.due_date === previousDueDateKey
        )
    })

    const previousPaidSoFar = paymentsForPreviousBill.reduce(
        (total, payment) => {
            return total + payment.amount
        },
        0
    )

    const previousRemainingAmount = Math.max(
        plannedAmount - previousPaidSoFar,
        0
    )

    const hasUnpaidPreviousOccurrence = 
        shouldCheckPreviousOccurrence && 
        previousRemainingAmount > 0

    const activeDueDate = 
        bill.frequency === "monthly"
            ? currentMonthDueDate
            : hasUnpaidPreviousOccurrence
                ? previousDueDate
                : nextDueDate
    
    const dueDateKey = formatDateKey(activeDueDate)

    const paymentsForCurrentBill = billPayments.filter((payment) => {
        return (
            payment.bill_id === bill.id &&
            payment.due_date === dueDateKey
        )
    })

    const paidSoFar = paymentsForCurrentBill.reduce(
        (total, payment) => {
            return total + payment.amount
        },
        0
    )

    const remainingAmount = Math.max(
        plannedAmount - paidSoFar,
        0
    )

    let paymentTargetDueDate
    let paymentTargetDueDateKey
    let targetRemainingAmount

    if (oldestUnpaidOccurrence) {
        paymentTargetDueDate = oldestUnpaidOccurrence.dueDate
        paymentTargetDueDateKey = oldestUnpaidOccurrence.dueDateKey
        targetRemainingAmount = oldestUnpaidOccurrence.remainingAmount
    } else {
        paymentTargetDueDate = getFollowingBillDueDate(bill, activeDueDate)
        paymentTargetDueDateKey = formatDateKey(paymentTargetDueDate)

        let targetIsPaid = true

        while (targetIsPaid) {
            const paymentsForTargetBill = paymentsForBill.filter((payment) => {
                return payment.due_date === paymentTargetDueDateKey
            })
            const targetPaidSoFar = paymentsForTargetBill.reduce((total, payment) => {
                return total + payment.amount
            },
            0
        )

        targetRemainingAmount = Math.max(plannedAmount - targetPaidSoFar, 0)

        if (targetRemainingAmount > 0) {
            targetIsPaid = false
        } else {
            paymentTargetDueDate = getFollowingBillDueDate(bill, paymentTargetDueDate)
            paymentTargetDueDateKey = formatDateKey(paymentTargetDueDate)
        }
        }
    }
    
    const today = new Date()

    today.setHours(0, 0, 0, 0)

    const isOverdue = activeDueDate < today
    const isDueToday = activeDueDate.getTime() === today.getTime()

    const paymentStatus =
        hasPastDue
            ? "Overdue"
            : remainingAmount === 0
                ? "Paid"
                : isOverdue
                    ? "Overdue"
                    : paidSoFar > 0
                        ? "Partial"
                        : isDueToday
                            ? "Due Today"
                            : "Upcoming"

    return {
        plannedAmount,
        activeDueDate,
        dueDateKey,
        paidSoFar,
        remainingAmount,
        paymentStatus,
        lastPayment,
        paymentTargetDueDate,
        paymentTargetDueDateKey,
        targetRemainingAmount,
        pastDueAmount,
        currentDueAmount,
        totalDueAmount,
        occurrences
    }
}

const buildPaymentAllocations = (occurrences, paymentAmount) => {
    let amountLeft = paymentAmount
    const allocations = []

    occurrences.forEach((occurrence) => {
        if (amountLeft <= 0) {
            return
        }

        if (occurrence.remainingAmount <= 0) {
            return
        }

        const amountForOccurrence = Math.min(amountLeft, occurrence.remainingAmount)

        allocations.push({
            dueDate: occurrence.dueDateKey,
            amount: amountForOccurrence
        })

        amountLeft -= amountForOccurrence
    })

    return allocations
}

const renderBills = () => {
    billsContainer.innerHTML = ""

    const activeBills = bills.filter((bill) => {
        return bill.active === true
    })

    const inactiveBills = bills.filter((bill) => {
        return bill.active === false
    })

    const billsToDisplay = showingInactiveBills
        ? inactiveBills 
        : activeBills

    if (billsToDisplay.length === 0) {
        billsContainer.innerHTML = `
            <div class="card bg-base-100 border border-base-300">
                <div class="card-body">
                    <p class="text-base-content/60">
                        ${
                            showingInactiveBills
                                ? "No inactive bills."
                                : "No active bills."
                        }
                    </p>
                </div>
            </div>
        `

        return
    }

    const sortedBills = [...billsToDisplay].sort((billA, billB) => {
        const stateA = getBillState(billA)
        const stateB = getBillState(billB)

        const statusPriority = {
            Overdue: 1,
            "Due Today": 2,
            Partial: 3,
            Upcoming: 4,
            Paid: 5
        }

        const priorityA = statusPriority[stateA.paymentStatus]
        const priorityB = statusPriority[stateB.paymentStatus]

        if (priorityA !== priorityB) {
            return priorityA - priorityB
        }

        return stateA.activeDueDate - stateB.activeDueDate
    })

    sortedBills.forEach((bill) => {
        const billState = getBillState(bill)

        const plannedAmount = billState.plannedAmount
        const activeDueDate = billState.activeDueDate
        const dueDateKey = billState.dueDateKey
        const paidSoFar = billState.paidSoFar
        const remainingAmount = billState.remainingAmount
        const paymentStatus = billState.paymentStatus
        const lastPayment = billState.lastPayment
        const paymentTargetDueDateKey = billState.paymentTargetDueDateKey
        const targetRemainingAmount = billState.targetRemainingAmount
        const pastDueAmount = billState.pastDueAmount
        const currentDueAmount = billState.currentDueAmount
        const totalDueAmount = billState.totalDueAmount

        const suggestedPaymentAmount = 
        pastDueAmount > 0 
            ? totalDueAmount 
            : targetRemainingAmount

        const fundingAccount = accounts.find((account) => {
            return account.id === bill.funding_account_id
        })

        const linkedAccount = accounts.find((account) => {
            return account.id === bill.linked_account_id
        })

        const dueText =
            bill.frequency === "monthly"
                ? `Due Day ${bill.due_day}`
                : `First Due Date ${bill.anchor_date?.split("T")[0]}`

        const displayAmount =
            bill.planned_payment ?? bill.expected_amount ?? bill.minimum_payment

        const extraPayment =
            bill.minimum_payment != null && bill.planned_payment != null
                ? bill.planned_payment - bill.minimum_payment
                : null

        const statusClass = 
            paymentStatus === "Overdue"
                ? "text-error"
                : paymentStatus === "Paid"
                    ? "text-success"
                    : paymentStatus === "Due Today" ||
                      paymentStatus === "Partial"
                        ? "text-warning"
                        : "text-base-content"

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
                        Due: ${formatDate(activeDueDate)}
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

                    <p class="text-sm text-base-content/70">
                        Paid So Far:
                        <span class="font-medium text-base-content">
                            ${formatCurrency(paidSoFar)}
                        </span>
                    </p>

                    <p class="text-sm text-base-content/70">
                        Last Payment:
                        <span class="font-medium text-base-content">
                            ${
                                lastPayment
                                    ? `${formatDate(new Date(`${lastPayment.payment_date}T00:00:00`))} — ${formatCurrency(lastPayment.amount)}`
                                    : "None"
                            }
                        </span>
                    </p>

                    <p class="text-sm text-base-content/70">
                        Past Due:
                        <span class="font-medium ${pastDueAmount > 0 ? "text-error" : "text-base-content"}">
                            ${formatCurrency(pastDueAmount)}
                        </span>
                    </p>

                    <p class="text-sm text-base-content/70">
                        Current Due:
                        <span class="font-medium text-base-content">
                            ${formatCurrency(currentDueAmount)}
                        </span>
                    </p>

                    <p class="text-sm text-base-content/70">
                        Total Due: 
                        <span class="font-semibold text-base-content">
                            ${formatCurrency(totalDueAmount)}
                        </span>
                    </p>

                    <p class="text-sm text-base-content/70">
                        Status:
                        <span class="font-semibold ${statusClass}">
                            ${paymentStatus}
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

                    ${
                        bill.active
                            ? `
                                <button
                                    class="btn btn-sm btn-outline mt-3 editBillButton"
                                    data-bill-id="${bill.id}"
                                >
                                    Edit Bill
                                </button>
                            `
                            : ""
                    }

                    ${
                        bill.active
                            ? `
                                <button
                                    class="btn btn-sm btn-outline mt-3 deactivateBillButton"
                                    data-bill-id=${bill.id}
                                >
                                    Deactivate
                                </button>
                            `
                            : `
                                <button 
                                    class="btn btn-sm btn-outline mt-3 reactivateBillButton"
                                    data-bill-id=${bill.id}
                                >
                                    Reactivate
                                </button>
                            `
                    }
              
                    ${
                        bill.active && targetRemainingAmount > 0
                            ? `
                                <button
                                    class="btn btn-sm btn-primary mt-3 recordPaymentButton"
                                    data-bill-id="${bill.id}"
                                    data-due-date="${paymentTargetDueDateKey}"
                                    data-remaining-amount="${suggestedPaymentAmount}"
                                >
                                    ${
                                        remainingAmount === 0
                                            ? "Record Next Payment"
                                            : "Record Payment"
                                    }
                                </button>
                            `
                            : ""
                    }  
                </div>
            </div>   
        `
    })

    const recordPaymentButtons = document.querySelectorAll(".recordPaymentButton")
    const editBillButtons = document.querySelectorAll(".editBillButton")
    const deactivateBillButtons = document.querySelectorAll(".deactivateBillButton")
    const reactivateBillButtons = document.querySelectorAll(".reactivateBillButton")

    deactivateBillButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const billId = button.dataset.billId

            const selectedBill = bills.find((bill) => {
                return bill.id === billId
            })

            const confirmed = window.confirm(
                `Deactivate ${selectedBill.name}?`
            )

            if (!confirmed) {
                return
            }

            try {
                const updateBill = await deactivateBill(selectedBill.id)

                const billIndex = bills.findIndex((bill) => {
                    return bill.id === selectedBill.id
                })

                bills[billIndex] = updateBill

                renderBills()
            } catch (error) {
                console.error("Bill could not be deactivated:", error)
            }
        })
    })

    reactivateBillButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const billId = button.dataset.billId

            const selectedBill = bills.find((bill) => {
                return bill.id === billId
            })

            try {
                const updatedBill = await reactivateBill(selectedBill.id)

                const billIndex = bills.findIndex((bill) => {
                    return bill.id === selectedBill.id
                })

                bills[billIndex] = updatedBill

                renderBills()
            } catch (error) {
                console.error("Bill could not be reactivated:", error)
            }
        })
    })

    editBillButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const billId = button.dataset.billId

            const selectedBill = bills.find((bill) => {
                return bill.id === billId
            })

            openBillModal(selectedBill)
        })
    })

    recordPaymentButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const storedPayment = getStoredPendingPayment()

            if (storedPayment && storedPayment.billId !== button.dataset.billId) {
                window.alert(
                    "An earlier payment for a different bill is still pending. " +
                    "Open that bill to recover its payment."
                )

                return
            }

            const billId = button.dataset.billId
            const dueDateKey = button.dataset.dueDate
            const remainingAmount = Number(button.dataset.remainingAmount)

            const selectedBill = bills.find((bill) => {
                return bill.id === billId
            })

            const modal = renderBillPaymentModal()

            const amountInput = document.getElementById("billPaymentAmount")
            const paymentDateInput = document.getElementById("billPaymentDate")
            const dueDateDisplay = document.getElementById("billPaymentDueDate")
            const cancelButton = document.getElementById("cancelBillPaymentButton")
            const form = document.getElementById("billPaymentForm")

            const paymentError = document.createElement("p")

            paymentError.className = "text-error text-sm mt-3"
            paymentError.setAttribute("role", "alert")
            paymentError.hidden = true

            form.appendChild(paymentError)

            let pendingPayment = storedPayment?.billId === billId ? storedPayment : null
            let isSubmittingPayment = false

            amountInput.value = remainingAmount

            paymentDateInput.value = new Date().toISOString().split("T")[0]

            if (pendingPayment) {
                amountInput.value = pendingPayment.allocations.reduce(
                    (total, allocation) => total + Number(allocation.amount),
                    0
                )

                paymentDateInput.value = pendingPayment.paymentDate

                amountInput.disabled = true
                paymentDateInput.disabled = true
            }

            dueDateDisplay.textContent = formatDate(new Date(`${dueDateKey}T00:00:00`))

            cancelButton.addEventListener("click", () => {
                if (isSubmittingPayment) {
                    return
                }

                if (pendingPayment) {
                    window.alert(
                        "This payment may have been partially saved. " +
                        "Retry the payment before closing this window."
                    ) 
                    return
                }

                modal.close()
            })

            modal.addEventListener("cancel", (event) => {
                if (isSubmittingPayment || pendingPayment) {
                    event.preventDefault()
                }
            })

            form.addEventListener("submit", async (event) => {
                event.preventDefault()

                if (isSubmittingPayment) {
                    return
                }

                if (pendingPayment) {
                    amountInput.value = pendingPayment.allocations
                        .reduce((total, allocation) => {
                            return total + allocation.amount
                        }, 0)

                    paymentDateInput.value = pendingPayment.paymentDate
                }

                if (!pendingPayment) {
                    const paymentAmount = Number(amountInput.value)
                    const currentBillState = getBillState(selectedBill)
                    const paymentGroupId = crypto.randomUUID()

                    let paymentAllocations

                    if (currentBillState.totalDueAmount > 0) {
                        paymentAllocations = buildPaymentAllocations(
                            currentBillState.occurrences,
                            paymentAmount
                        )
                    } else {
                        paymentAllocations = [
                            {
                                dueDate: dueDateKey,
                                amount: paymentAmount
                            }
                        ]
                    }

                    pendingPayment = {
                        paymentGroupId,
                        billId: selectedBill.id,
                        paymentDate: paymentDateInput.value,
                        allocations: paymentAllocations.map((allocation) => {
                            return {
                                dueDate: allocation.dueDate,
                                amount: allocation.amount,
                                idempotencyKey: crypto.randomUUID()
                            }
                        })
                    }

                    localStorage.setItem(PENDING_BILL_PAYMENT_KEY, JSON.stringify(pendingPayment))
                }

                isSubmittingPayment = true
                amountInput.disabled = true
                paymentDateInput.disabled = true
                paymentError.hidden = true
                paymentError.textContent = ""

                try {
                    const savedPayments = []

                    for (const allocation of pendingPayment.allocations) {
                        const paymentData = {
                            paymentGroupId: pendingPayment.paymentGroupId,
                            billId: pendingPayment.billId,
                            dueDate: allocation.dueDate,
                            amount: allocation.amount,
                            paymentDate: pendingPayment.paymentDate,
                            idempotencyKey: allocation.idempotencyKey
                        }

                        const savedPayment = await createBillPayment(paymentData)

                        savedPayments.push(savedPayment)
                    }

                    savedPayments.forEach((savedPayment) => {
                        const alreadyExists = billPayments.some((payment) => {
                            return payment.id === savedPayment.id
                        })

                        if (!alreadyExists) {
                            billPayments.push(savedPayment)
                        }
                    })

                    localStorage.removeItem(PENDING_BILL_PAYMENT_KEY)
                    pendingPayment = null

                    modal.close()
                    renderBills()
                } catch (error) {
                    console.error("Bill payment could not be saved:", error)

                    paymentError.textContent = 
                        `Payment could not be confirmed: ${error.message}. ` +
                        "Your original payment details have been preserved. " +
                        "Use the submit button to retry."

                    paymentError.hidden = false
                } finally {
                    isSubmittingPayment = false

                    if (!pendingPayment) {
                        amountInput.disabled = false
                        paymentDateInput.disabled = false
                    }
                }
            })

            modal.showModal()
        })
    })
}

loadBills()
