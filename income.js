import { renderLayout } from "./components/layout.js"
import { 
    getIncomeSources,
    createIncomeSource,
    updateIncomeSource,
    deactivateIncomeSources,
    reactivateIncomeSource,
    getIncomeDepositRules,
    updateIncomeDepositRules
} from "./api/incomeSourcesApi.js"
import { renderIncomeSourceModal } from "./incomeSourceModal.js"
import { getAccounts } from "./api/accountsApi.js"
import { getNextPayday } from "./utils/paydayCalculations.js"
import { renderIncomeDepositModal } from "./incomeDepositModal.js"

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

actionButton.addEventListener("click", () => {
    openIncomeSourceModal()
})

loadIncomeSources()