import { renderLayout } from "./components/layout.js"
import { 
    getIncomeSources,
    createIncomeSource,
    updateIncomeSource,
    deactivateIncomeSources,
    reactivateIncomeSource,
    getIncomeDepositRules,
    updateIncomeDepositRules,
    getIncomeDeductions,
    updateIncomeDeductions
} from "./api/incomeSourcesApi.js"
import { renderIncomeSourceModal } from "./incomeSourceModal.js"
import { getAccounts } from "./api/accountsApi.js"
import { getNextPayday } from "./utils/paydayCalculations.js"
import { renderIncomeDepositModal } from "./incomeDepositModal.js"
import { renderIncomeDeductionsModal } from "./incomeDeductionsModal.js"
import { renderPaycheckEstimatorModal } from "./paycheckEstimatorModal.js"
import { calculateGrossPay } from "./utils/paycheckCalculations.js"
import { estimatePaycheck } from "./utils/paycheckEstimate.js"
import { calculateDepositDistribution } from "./utils/depositCalculations.js"

renderLayout({
    title: "Income",
    activePage: "income",
    actionLabel: "Add Income Source +"
})

const incomeSourcesContainer = document.getElementById("incomeSourcesContainer")
const actionButton = document.getElementById("pageActionButton")
const toggleInactiveIncomeButton = document.getElementById("toggleInactiveIncomeButton")

const incomeSources = []
const accounts = []
let showingInactiveIncomeSources = false

const renderIncomeSources = () => {
    incomeSourcesContainer.innerHTML = ""

    const activeIncomeSources = incomeSources.filter((source) => {
        return source.active === true
    })

    const inactiveIncomeSources = incomeSources.filter((source) => {
        return source.active === false
    })

    const incomeSourcesToDisplay = showingInactiveIncomeSources
        ? inactiveIncomeSources
        : activeIncomeSources

    if (incomeSourcesToDisplay.length === 0) {
        incomeSourcesContainer.innerHTML = `
            <div class="card bg-base-100 border border-base-300">
                <div class="card-body">
                    <p class="text-base-content/60">
                        No Income sources yet.
                    </p>
                </div>
            </div>
        `

        return
    }

    incomeSourcesToDisplay.forEach((incomeSource) => {
        const nextPayday = getNextPayday(incomeSource)

        const nexPaydayText = nextPayday
            ? nextPayday.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric"
            })
            : "Not Available"

        incomeSourcesContainer.innerHTML += `
            <div class="card bg-base-100 border border-base-300">
                <div class="card-body">
                    <h2 class="card-title">
                        ${incomeSource.name}
                    </h2>

                    <p class="capitalize">
                        ${incomeSource.pay_type}
                    </p>

                    <p class="capitalize text-base-content/70">
                        ${incomeSource.frequency}
                    </p>
                    <p class="text-sm text-base-content/70">
                        Next Payday: 
                        <span class="font-semibold text-base-content">
                            ${nexPaydayText}
                        </span>
                    </p>

                    <div class="flex flex-wrap gap-2 mt-3">
                        ${
                            incomeSource.active
                                ? `
                                    <button
                                        class="btn btn-sm btn-outline editIncomeSourceButton"
                                        data-income-id="${incomeSource.id}"
                                    >
                                        Edit Income Source
                                    </button>

                                    <button
                                        class="btn btn-sm btn-outline configureDepositsButton"
                                        data-income-id="${incomeSource.id}"
                                    >
                                        Configure Deposits
                                    </button>

                                    <button
                                        class="btn btn-sm btn-outline configureDeductionsButton"
                                        data-income-id="${incomeSource.id}"
                                    >
                                        Configure Deductions
                                    </button>

                                    ${incomeSource.pay_type === "hourly" ? `
                                        <button
                                            class="btn btn-sm btn-primary estimatePaycheckButton"
                                            data-income-id="${incomeSource.id}"
                                        >
                                            Estimate Paycheck
                                        </button>
                                    ` : ""}

                                    <button
                                        class="btn btn-sm btn-outline deactivateIncomeSourceButton"
                                        data-income-id="${incomeSource.id}"
                                    >
                                        Deactivate
                                    </button>
                                `
                                : `
                                    <button
                                        class="btn btn-sm btn-outline reactivateIncomeSourceButton"
                                        data-income-id="${incomeSource.id}"
                                    >
                                        Reactivate
                                    </button>
                                `
                        }
                    </div>
                </div>
            </div>
        `
    })
}

const loadIncomeSources = async () => {
    try {
        const [savedIncomeSources, savedAccounts] = 
        await Promise.all([
            getIncomeSources(),
            getAccounts()
        ])

        incomeSources.push(...savedIncomeSources)
        accounts.push(...savedAccounts)

        renderIncomeSources()
    } catch (error) {
        console.error("Income sources could not be loaded:", error)
    }
}

const openIncomeSourceModal = (incomeSource = null) => {
    const modal = renderIncomeSourceModal(incomeSource)

    const cancelButton = document.getElementById("cancelIncomeSourceButton")
    const frequencySelect = document.getElementById("incomeFrequency")
    const anchorDateField = document.getElementById("incomeAnchorDateField")
    const payDay1Field = document.getElementById("incomePayDay1Field")
    const payDay2Field = document.getElementById("incomePayDay2Field")
    const anchorDateInput = document.getElementById("incomeAnchorDate")
    const payDay1Input = document.getElementById("incomePayDay1")
    const payDay2Input = document.getElementById("incomePayDay2")
    const form = document.getElementById("incomeSourceForm")
    const depositAccountSelect = document.getElementById("incomeDepositAccount")
    const payTypeSelect = document.getElementById("incomePayType")
    const hourlyFields = document.getElementById("incomeHourlyFields")
    const hourlyRateInput = document.getElementById("incomeHourlyRate")
    const overtimeMultiplierInput = document.getElementById("incomeOvertimeMultiplier")

    const updatePayTypeFields = () => {
        const isHourly = payTypeSelect.value === "hourly"

        hourlyFields.hidden = !isHourly

        hourlyRateInput.required = isHourly
        overtimeMultiplierInput.required = isHourly
    }

    payTypeSelect.addEventListener("change", updatePayTypeFields)

    updatePayTypeFields()

    accounts.forEach((account) => {
        if (
            account.type === "checking" || account.type === "savings"
        ) {
            const option = document.createElement("option")

            option.value = account.id
            option.textContent = account.name

            depositAccountSelect.appendChild(option)
        }
    })

    if (incomeSource) {
        depositAccountSelect.value = incomeSource.deposit_account_id ?? ""
    }

    const updateScheduleFields = () => {
        const frequency = frequencySelect.value

        const usesAnchorDate = frequency === "weekly" || frequency === "biweekly"
        const usesPayDay1 = frequency === "monthly" || frequency === "semimonthly"
        const usesPayDay2 = frequency === "semimonthly"

        anchorDateField.hidden = !usesAnchorDate
        payDay1Field.hidden = !usesPayDay1
        payDay2Field.hidden = !usesPayDay2

        anchorDateInput.required = usesAnchorDate
        payDay1Input.required = usesPayDay1
        payDay2Input.required = usesPayDay2
    }

    frequencySelect.addEventListener("change", updateScheduleFields)

    updateScheduleFields()

    form.addEventListener("submit", async (event) => {
        event.preventDefault()

        const frequency = frequencySelect.value
        const isHourly = payTypeSelect.value === "hourly"

        const incomeSourceData = {
            name: document.getElementById("incomeName").value.trim(),
            payType: document.getElementById("incomePayType").value,
            hourlyRate: isHourly ? Number(hourlyRateInput.value) : null,
            overtimeMultiplier: isHourly ? Number(overtimeMultiplierInput.value) : 1.50,
            frequency: frequency,

            anchorDate: frequency === "weekly" || frequency === "biweekly" ? anchorDateInput.value : null,
            payDay1: frequency === "monthly" || frequency === "semimonthly" ? Number(payDay1Input.value) : null,
            payDay2: frequency === "semimonthly" ? Number(payDay2Input.value) : null,
            depositAccountId: depositAccountSelect.value || null
        }

        try {
            let savedIncomeSource

            if (incomeSource) {
                savedIncomeSource = await updateIncomeSource(incomeSource.id, incomeSourceData)

                const incomeSourceIndex = incomeSources.findIndex((source) => {
                    return source.id === incomeSource.id
                })

                incomeSources[incomeSourceIndex] = savedIncomeSource
            } else {
                savedIncomeSource = await createIncomeSource(incomeSourceData)
                
                incomeSources.push(savedIncomeSource)
            }

            renderIncomeSources()
            modal.close()
        } catch (error) {
            console.error("Income source could not be saved", error)
        }
    })
 
    cancelButton.addEventListener("click", () => {
        modal.close()
    })

    modal.showModal()
}

toggleInactiveIncomeButton.addEventListener("click", () => {
    showingInactiveIncomeSources = !showingInactiveIncomeSources

    toggleInactiveIncomeButton.textContent =
        showingInactiveIncomeSources
            ? "View Active Income Sources"
            : "View Inactive Income Sources"

    renderIncomeSources()
})

incomeSourcesContainer.addEventListener("click", (event) => {
    const editButton = event.target.closest(".editIncomeSourceButton")

    if (!editButton) {
        return
    }

    const incomeSourceId = editButton.dataset.incomeId

    const selectedIncomeSource = incomeSources.find((incomeSource) => {
        return incomeSource.id === incomeSourceId
    })

    if (!selectedIncomeSource) {
        return
    }

    openIncomeSourceModal(selectedIncomeSource)
})

incomeSourcesContainer.addEventListener("click", async (event) => {
    const button = event.target.closest(
        ".deactivateIncomeSourceButton, .reactivateIncomeSourceButton"
    )

    if (!button) {
        return
    }

    const incomeSourceId = button.dataset.incomeId

    const incomeSourceIndex = incomeSources.findIndex((source) => {
        return source.id === incomeSourceId
    })

    if (incomeSourceIndex === -1) {
        return
    }

    const isDeactivating = button.classList.contains("deactivateIncomeSourceButton")

    if (isDeactivating) {
        const confirmed = window.confirm(
            `Deactivate ${incomeSources[incomeSourceIndex].name}?`
        )

        if (!confirmed) {
            return
        }
    }

    button.disabled = true

    try {
        let updatedIncomeSource

        if (isDeactivating) {
            updatedIncomeSource = await deactivateIncomeSources(incomeSourceId)
        } else {
            updatedIncomeSource = await reactivateIncomeSource(incomeSourceId)
        }

        incomeSources[incomeSourceIndex] = updatedIncomeSource

        renderIncomeSources()
    } catch (error) {
        button.disabled = false
        console.error("Income source status could not be updated:", error)
    }
})

incomeSourcesContainer.addEventListener("click", async (event) => {
    const button = event.target.closest(".configureDepositsButton")

    if (!button) {
        return
    }

    const incomeSourceId = button.dataset.incomeId

    try {
        const depositRules = await getIncomeDepositRules(incomeSourceId)
        const modal = renderIncomeDepositModal()

        const rulesContainer = document.getElementById("depositRulesContainer")
        const addDepositAccountButton = document.getElementById("addDepositAccountButton")

        const addDepositRuleRow = (existingRule = null) => {
            const ruleRow = document.createElement("div")

            ruleRow.className = "depositRuleRow border border-base-300 rounded-lg p-3 space-y-3"

            ruleRow.innerHTML = `
                <div>
                    <label class="label">Deposit Account</div>
                    <select class="select select-bordered w-full depositAccountSelect">
                        <option value="">Select an Account</option>
                    </select>
                </div>

                <div>
                    <label class="label">Distribution Method</label>
                    <select class="select select-bordered w-full depositMethodSelect">
                        <option value="fixed">Fixed Amount</option>
                        <option value="percentage">Percentage</option>
                        <option value="remainder">Remainder</option>
                    </select>
                </div>

                <div class="depositAmountField">
                    <label class="label depositAmountLabel">Amount ($)</label>
                    <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        class="input input-bordered w-full depositValueInput"
                        required
                    />
                </div>

                <button
                    type="button"
                    class="btn btn-sm btn-outline btn-error removeDepositRuleButton"
                >
                    Remove
                </button>
            `

            const accountSelect = ruleRow.querySelector(".depositAccountSelect")

            accounts.forEach((account) => {
                if (
                    account.type === "checking" ||
                    account.type === "savings"
                ) {
                    const option = document.createElement("option")

                    option.value = account.id
                    option.textContent = account.name
                    
                    accountSelect.appendChild(option)
                }
            })

            const methodSelect = ruleRow.querySelector(".depositMethodSelect")
            const amountField = ruleRow.querySelector(".depositAmountField")
            const amountLabel = ruleRow.querySelector(".depositAmountLabel")
            const valueInput = ruleRow.querySelector(".depositValueInput")
            const removeButton = ruleRow.querySelector(".removeDepositRuleButton")

            methodSelect.addEventListener("change", () => {
                const method = methodSelect.value

                amountField.hidden = method === "remainder"
                valueInput.required = method !== "remainder"
                valueInput.disabled = method === "remainder"

                amountLabel.textContent =
                    method === "percentage"
                        ? "Percentage (%)"
                        : "Amount ($)"

                valueInput.max = method === "percentage" ? "100" : ""

                if (method === "remainder") {
                    valueInput.value = ""
                }
            })

            removeButton.addEventListener("click", () => {
                ruleRow.remove()
            })

            if (existingRule) {
                accountSelect.value = existingRule.account_id
                methodSelect.value = existingRule.method

                valueInput.value = existingRule.value ?? ""

                methodSelect.dispatchEvent(new Event("change"))
            }

            rulesContainer.appendChild(ruleRow)
        }

        if (depositRules.length === 0) {
            addDepositRuleRow()
        } else {
            depositRules.forEach((rule) => {
                addDepositRuleRow(rule)
            })
        }
        
        addDepositAccountButton.addEventListener("click", () => {
            addDepositRuleRow()
        })

        const saveDepositRulesButton = document.getElementById("saveDepositRulesButton")

        saveDepositRulesButton.addEventListener("click", async () => {
            const rows = rulesContainer.querySelectorAll(".depositRuleRow")

            const rules = Array.from(rows).map((row) => {
                const accountId = row.querySelector(".depositAccountSelect").value
                const method = row.querySelector(".depositMethodSelect").value
                const valueInput = row.querySelector(".depositValueInput")

                return {
                    accountId,
                    method,
                    value: method === "remainder" ? null : Number(valueInput.value)
                }
            })

            if (
                rules.length === 0 ||
                rules.some((rule) => !rule.accountId)
            ) {
                alert("Select an account for every deposit rule.")
                return
            }

            const accountIds = rules.map((rule) => rule.accountId)

            if (new Set(accountIds).size !== accountIds.length) {
                alert("Each deposit account can only appear once.")
                return
            }

            const remainderCount = rules.filter((rule) => {
                return rule.method === "remainder"
            }).length

            if (remainderCount !== 1) {
                alert("Exactly one account must receive the remainder.")
                return
            }

            if (rules.some((rule) => {
                return rule.method !== "remainder" && 
                    (!Number.isFinite(rule.value) || rule.value <= 0)
            })) {
                alert ("Enter a valid amount for each")
                return
            }

            saveDepositRulesButton.disabled = true

            try {
                await updateIncomeDepositRules(incomeSourceId, rules)
                modal.close()
            } catch (error) {
                console.error("Could not save deposit rules:", error)
                alert("Deposit distribution could not be saved.")
            } finally {
                saveDepositRulesButton.disabled = false
            }
        })

        const closeButton = document.getElementById("cancelDepositButton")

        closeButton.addEventListener("click", () => {
            modal.close()
        })

        modal.showModal()
    } catch (error) {
        console.error("Could not load deposit rules:", error)
    }
})

incomeSourcesContainer.addEventListener("click", async (event) => {
    const button = event.target.closest(".configureDeductionsButton")

    if (!button) {
        return
    }

    const incomeSourceId = button.dataset.incomeId

    try {
        const deductions = await getIncomeDeductions(incomeSourceId)

        const modal = renderIncomeDeductionsModal()

        const deductionsContainer = document.getElementById("incomeDeductionsContainer")

        deductionsContainer.innerHTML = ""

        const addDeductionButton = document.getElementById("addIncomeDeductionButton")

        const addDeductionRow = (existingDeduction = null) => {
            const deductionRow = document.createElement("div")
            deductionRow.className = "deductionRow border border-base-300 rounded-lg p-3 space-y-3"

            deductionRow.innerHTML = `
                <div>
                    <label class="label">Deduction Name</label>
                    <input
                        type="text"
                        class="input input-bordered w-full deductionNameInput"
                        placeholder="Example: Health Insurance"
                    />
                </div>

                <div>
                    <label class="label">Category</label>
                    <select class="select select-bordered w-full deductionCategorySelect">
                        <option value="insurance">Insurance</option>
                        <option value="retirement">Retirement</option>
                        <option value="tax">Tax</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div>
                    <label class="label">Calculation Method</label>
                    <select class="select select-bordered w-full deductionMethodSelect">
                        <option value="fixed">Fixed Amount</option>
                        <option value="percentage">Percentage</option>
                    </select>
                </div>

                <div>
                    <label class="label">Amount ($)</label>
                    <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        class="input input-bordered w-full deductionValueInput"
                    />
                </div>

                <div class="border-t border-base-300 pt-3 space-y-3">
                    <h4 class="font-semibold text-sm">
                        Tax Treatment
                    </h4>

                    <p class="text-xs text-base-content/60">
                        Select which taxable wages this deduction reduces.
                    </p>

                    <label class="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            class="checkbox checkbox-sm deductionFederalTaxCheckbox"
                        />
                        <span class="text-sm">Reduces Federal Taxable Wages</span>
                    </label>

                    <label class="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            class="checkbox checkbox-sm deductionStateTaxCheckbox"
                        />
                        <span class="text-sm">Reduces State Taxable Wages</span>
                    </label>

                    <label class="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            class="checkbox checkbox-sm deductionFicaTaxCheckbox"
                        />
                        <span class="text-sm">Reduces Social Security / Medicare Wages</span>
                    </label>
                </div>

                <button
                    type="button"
                    class="btn btn-sm btn-error btn-outline removeDeductionButton"
                >
                    Remove Deduction
                </button>
            `

            if (existingDeduction) {
                deductionRow.querySelector(".deductionNameInput").value = existingDeduction.name
                deductionRow.querySelector(".deductionCategorySelect").value = existingDeduction.category
                deductionRow.querySelector(".deductionMethodSelect").value = existingDeduction.method
                deductionRow.querySelector(".deductionValueInput").value = existingDeduction.value

                deductionRow.querySelector(".deductionFederalTaxCheckbox").checked = 
                    existingDeduction.reduces_federal_taxable_wages === true

                deductionRow.querySelector(".deductionStateTaxCheckbox").checked =
                    existingDeduction.reduces_state_taxable_wages === true
                
                deductionRow.querySelector(".deductionFicaTaxCheckbox").checked =
                    existingDeduction.reduces_fica_taxable_wages === true
            }

            const removeButton = deductionRow.querySelector(".removeDeductionButton")

            removeButton.addEventListener("click", () => {
                deductionRow.remove()
            })

            deductionsContainer.appendChild(deductionRow)
        }
        
        addDeductionButton.addEventListener("click", () => {
            addDeductionRow()
        })

        deductions.forEach((deduction) => {
            addDeductionRow(deduction)
        })

        const saveButton = document.getElementById("saveIncomeDeductionsButton")

        saveButton.addEventListener("click", async () => {
            const deductionRows = deductionsContainer.querySelectorAll(".deductionRow")

            const updatedDeductions = []

            for (const row of deductionRows) {
                const name = row.querySelector(".deductionNameInput").value.trim()
                const category = row.querySelector(".deductionCategorySelect").value
                const method = row.querySelector(".deductionMethodSelect").value
                const value = Number(row.querySelector(".deductionValueInput").value)

                if (!name || !Number.isFinite(value) || value <= 0) {
                    alert("Each deduction needs a name and an amount greater than zero.")
                    return
                }

                if (method === "percentage" && value > 100) {
                    alert("A percentage deduction cannot exceed 100%.")
                    return
                }

                updatedDeductions.push({
                    name: name,
                    category: category,
                    method: method,
                    value: value,
                    reduces_federal_taxable_wages: row.querySelector(".deductionFederalTaxCheckbox").checked,
                    reduces_state_taxable_wages: row.querySelector(".deductionStateTaxCheckbox").checked,
                    reduces_fica_taxable_wages: row.querySelector(".deductionFicaTaxCheckbox").checked
                })
            }

            try {
                saveButton.disabled = true
                
                await updateIncomeDeductions(incomeSourceId, updatedDeductions)

                modal.close()
            } catch (error) {
                console.error("Could not save deductions:", error)
                alert("Failed to save paycheck deductions.")
            } finally {
                saveButton.disabled = false
            }
        })

        const closeButton = document.getElementById("closeDeductionsButton")

        closeButton.addEventListener("click", () => {
            modal.close()
        })

        modal.showModal()
    } catch (error) {
        console.error("Could not load income deductions:", error)
    }
})

incomeSourcesContainer.addEventListener("click", async (event) => {
    const button = event.target.closest(".estimatePaycheckButton")

    if (!button) {
        return
    }

    const incomeSourceId = button.dataset.incomeId

    const incomeSource = incomeSources.find((source) => {
        return source.id === incomeSourceId
    })

    if (!incomeSource) {
        console.error("Income source not found")
        return
    }

    let deductions = []
    let depositRules = []

    try {
        deductions = await getIncomeDeductions(incomeSourceId)
        depositRules = await getIncomeDepositRules(incomeSourceId)

        console.log("Estimator Deductions:", deductions)
        console.log("Estimator Deposit Rules:", depositRules)
    } catch (error) {
        console.error("Failed to load paycheck settings:", error)
        alert("Unable to load paycheck settings.")
        return
    }

    const modal = renderPaycheckEstimatorModal(incomeSource)

    const regularHoursInput = document.getElementById("estimatorRegularHours")
    const overtimeHoursInput = document.getElementById("estimatorOvertimeHours")
    const grossPayDisplay = document.getElementById("estimatorGrossPay")
    const regularDifferentialHoursInput = document.getElementById("estimatorRegularDifferentialHours")
    const overtimeDifferentialHoursInput = document.getElementById("estimatorOvertimeDifferentialHours")
    const differentialPercentInput = document.getElementById("estimatorDifferentialPercent")
    const additionalEarningsContainer = document.getElementById("estimatorAdditionalEarningsContainer")
    const addEarningButton = document.getElementById("addEstimatorEarningButton")
    const regularPayDisplay = document.getElementById("estimatorRegularPay")
    const overtimePayDisplay = document.getElementById("estimatorOvertimePay")
    const shiftDifferentialPayDisplay = document.getElementById("estimatorShiftDifferentialPay")
    const additionalEarningsPayDisplay = document.getElementById("estimatorAdditionalEarningsPay")
    const summaryGrossPayDisplay = document.getElementById("estimatorSummaryGrossPay")
    const totalDeductionsDisplay = document.getElementById("estimatorTotalDeductions")
    const netPayDisplay = document.getElementById("estimatorNetPay")
    const deductionBreakdownContainer = document.getElementById("estimatorDeductionBreakdown")
    const bankDepositsContainer = document.getElementById("estimatorBankDeposits")

    const formatCurrency = (amount) => {
        return amount.toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
        })
    }

    const updatePaycheckEstimate = () => {
        try {
            const earningRows = additionalEarningsContainer.querySelectorAll(".additionalEarningRow")

            const additionalEarnings = []

            for (const row of earningRows) {
                const name = row.querySelector(".earningNameInput").value.trim()
                const method = row.querySelector(".earningMethodSelect").value
                const value = row.querySelector(".earningAmountInput").value

                if (method === "hourly") {
                    additionalEarnings.push({
                        name: name,
                        method: method,
                        hours: value
                    })
                } else {
                    additionalEarnings.push({
                        name: name,
                        method: method,
                        amount: value
                    })
                }
            }

            const noWorkedHours = 
                Number(regularHoursInput.value) === 0 &&
                Number(overtimeHoursInput.value) === 0

            const noAdditionalEarnings = additionalEarnings.every((earning) => {
                const value = earning.method === "hourly"
                    ? earning.hours
                    : earning.amount

                return Number(value) === 0
            })

            if (noWorkedHours && noAdditionalEarnings) {
                regularPayDisplay.textContent = formatCurrency(0)
                overtimePayDisplay.textContent = formatCurrency(0)
                shiftDifferentialPayDisplay.textContent = formatCurrency(0)
                additionalEarningsPayDisplay.textContent = formatCurrency(0)
                grossPayDisplay.textContent = formatCurrency(0)
                summaryGrossPayDisplay.textContent = formatCurrency(0)
                totalDeductionsDisplay.textContent = "—"
                netPayDisplay.textContent = "Enter hours or earnings"
                deductionBreakdownContainer.innerHTML = ""
                bankDepositsContainer.textContent = "Enter earnings to see expected deposits."

                return

            }

            const payDetails = {
                regularHours: Number(regularHoursInput.value),
                overtimeHours: Number(overtimeHoursInput.value),
                hourlyRate: Number(incomeSource.hourly_rate),
                overtimeMultiplier: Number(incomeSource.overtime_multiplier),
                regularDifferentialHours: Number(regularDifferentialHoursInput.value),
                overtimeDifferentialHours: Number(overtimeDifferentialHoursInput.value),
                differentialPercent: Number(differentialPercentInput.value),
                additionalEarnings: additionalEarnings
            }

            let result

            try {
                result = estimatePaycheck(payDetails, deductions)
            } catch (error) {
                if (error.message !== "Deductions cannot exceed gross pay") {
                    throw error
                }

                const grossResult = calculateGrossPay(payDetails)

                regularPayDisplay.textContent = formatCurrency(grossResult.regularPay)
                overtimePayDisplay.textContent = formatCurrency(grossResult.overtimePay)
                shiftDifferentialPayDisplay.textContent = formatCurrency(grossResult.shiftDifferentialPay)
                additionalEarningsPayDisplay.textContent = formatCurrency(grossResult.additionalEarningsPay)
                grossPayDisplay.textContent = formatCurrency(grossResult.grossPay)
                summaryGrossPayDisplay.textContent = formatCurrency(grossResult.grossPay)
                totalDeductionsDisplay.textContent = "Exceed gross pay"
                netPayDisplay.textContent = "Insufficient earnings"
                deductionBreakdownContainer.innerHTML = ""
                bankDepositsContainer.textContent = "Not available until earnings over configured deduction"

                return
            }

            bankDepositsContainer.innerHTML = ""

            if (depositRules.length === 0) {
                bankDepositsContainer.textContent = "No Deposit distribution configured."
            } else {
                try {
                    const distribution = calculateDepositDistribution(
                        result.netPay,
                        depositRules
                    )

                    distribution.forEach((deposit) => {
                        const account = accounts.find((account) => {
                            return account.id === deposit.accountId
                        })

                        const depositRow = document.createElement("div")
                        depositRow.className = "flex justify-between items-center gap-3"

                        const accountName = document.createElement("span")
                        accountName.className = "text-sm"
                        accountName.textContent = account
                            ? account.name
                            : "Unknown account"

                        const depositAmount = document.createElement("span")
                        depositAmount.className = "font-semibold"
                        depositAmount.textContent = formatCurrency(deposit.amount)

                        depositRow.append(accountName, depositAmount)

                        bankDepositsContainer.appendChild(depositRow)
                    })
                } catch (error) {
                    bankDepositsContainer.textContent = 
                        "Unable to distribute this paycheck using the configured rules."

                    console.warn("Deposit distribution error:", error)
                }
            }

            regularPayDisplay.textContent = formatCurrency(result.regularPay)
            overtimePayDisplay.textContent = formatCurrency(result.overtimePay)
            shiftDifferentialPayDisplay.textContent = formatCurrency(result.shiftDifferentialPay)
            additionalEarningsPayDisplay.textContent = formatCurrency(result.additionalEarningsPay)
            grossPayDisplay.textContent = formatCurrency(result.grossPay)
            summaryGrossPayDisplay.textContent = formatCurrency(result.grossPay)
            totalDeductionsDisplay.textContent = `-${formatCurrency(result.totalDeductions)}`
            netPayDisplay.textContent = formatCurrency(result.netPay)

            deductionBreakdownContainer.innerHTML = ""

            result.deductionsBreakdown.forEach((deduction) => {
                const deductionRow = document.createElement("div")

                deductionRow.className = "flex justify-between text-sm gap-3"

                const deductionName = document.createElement("span")
                deductionName.className = "text-base-content/70"
                deductionName.textContent = deduction.name

                const deductionAmount = document.createElement("span")
                deductionAmount.textContent = `-${formatCurrency(deduction.amount)}`

                deductionRow.append(deductionName, deductionAmount)

                deductionBreakdownContainer.appendChild(deductionRow)
            })
        } catch (error) {
            grossPayDisplay.textContent = "Invalid earnings"
            regularPayDisplay.textContent = "—"
            overtimePayDisplay.textContent = "—"
            shiftDifferentialPayDisplay.textContent = "—"
            additionalEarningsPayDisplay.textContent = "—"
            summaryGrossPayDisplay.textContent = "—"
            totalDeductionsDisplay.textContent = "—"
            netPayDisplay.textContent = "—"
            deductionBreakdownContainer.innerHTML = "" 
            console.error(error)
        }
    }

    const addEarningRow = () => {
        const earningRow = document.createElement("div")

        earningRow.className = "additionalEarningRow border border-base-300 rounded-lg p-3 space-y-2"

        earningRow.innerHTML = `
            <div>
                <label class="label">Earning Name</label>
                <input
                    type="text"
                    class="input input-bordered w-full earningNameInput"
                    placeholder="Example: On-Call Stipend"
                />
            </div>

            <div>
                <label class="label">Calculation Method</label>
                <select class="select select-bordered w-full earningMethodSelect">
                    <option value="fixed">Fixed Dollar Amount</option>
                    <option value="hourly">Hourly Pay</option>
                </select>
            </div>

            <div>
                <label class="label earningValueLabel">Amount ($)</label>
                <input
                    type="number"
                    class="input input-bordered w-full earningAmountInput"
                    min="0"
                    step="0.01"
                    value="0"
                />
            </div>

            <button
                type="button"
                class="btn btn-sm btn-error btn-outline removeEarningButton"
            >
                Remove
            </button>
        `

        const removeButton = earningRow.querySelector(".removeEarningButton")

        removeButton.addEventListener("click", () => {
            earningRow.remove()
            updatePaycheckEstimate()
        })

        const earningAmountInput = earningRow.querySelector(".earningAmountInput")

        const earningMethodSelect = earningRow.querySelector(".earningMethodSelect")
        const earningValueLabel = earningRow.querySelector(".earningValueLabel")

        earningMethodSelect.addEventListener("change", () => {
            if (earningMethodSelect.value === "hourly") {
                earningValueLabel.textContent = "Paid Hours"
            } else {
                earningValueLabel.textContent = "Amount ($)"
            }
            
            earningAmountInput.value = "0"
            
            updatePaycheckEstimate()
        })

        earningAmountInput.addEventListener("input", updatePaycheckEstimate)

        additionalEarningsContainer.appendChild(earningRow)
    }

    addEarningButton.addEventListener("click", () => {
        addEarningRow()
    })

    regularHoursInput.addEventListener("input", updatePaycheckEstimate)
    overtimeHoursInput.addEventListener("input", updatePaycheckEstimate)
    regularDifferentialHoursInput.addEventListener("input", updatePaycheckEstimate)
    overtimeDifferentialHoursInput.addEventListener("input", updatePaycheckEstimate)
    differentialPercentInput.addEventListener("input", updatePaycheckEstimate)

    updatePaycheckEstimate()

    const closeButton = document.getElementById("closePaycheckEstimatorButton")

    closeButton.addEventListener("click", () => {
        modal.close()
    })

    modal.showModal()
})

actionButton.addEventListener("click", () => {
    openIncomeSourceModal()
})

loadIncomeSources()