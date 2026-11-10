import { renderLayout } from "./components/layout.js"
import { 
    getIncomeSources,
    createIncomeSource,
    updateIncomeSource,
    deactivateIncomeSources,
    reactivateIncomeSource
} from "./api/incomeSourcesApi.js"
import { renderIncomeSourceModal } from "./incomeSourceModal.js"
import { getAccounts } from "./api/accountsApi.js"
import { getNextPayday } from "./utils/paydayCalculations.js"

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

        const incomeSourceData = {
            name: document.getElementById("incomeName").value.trim(),
            payType: document.getElementById("incomePayType").value,
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

actionButton.addEventListener("click", () => {
    openIncomeSourceModal()
})

loadIncomeSources()