import { renderLayout } from "./components/layout.js"
import { getIncomeSources, createIncomeSource, updateIncomeSource } from "./api/incomeSourcesApi.js"
import { renderIncomeSourceModal } from "./incomeSourceModal.js"
import { getAccounts } from "./api/accountsApi.js"

renderLayout({
    title: "Income",
    activePage: "income",
    actionLabel: "Add Income Source +"
})

const incomeSourcesContainer = document.getElementById("incomeSourcesContainer")
const actionButton = document.getElementById("pageActionButton")

const incomeSources = []
const accounts = []

const renderIncomeSources = () => {
    incomeSourcesContainer.innerHTML = ""

    if (incomeSources.length === 0) {
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

    incomeSources.forEach((incomeSource) => {
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
                    <button
                        class="btn btn-sm btn-outline mt-3 self-start editIncomeSourceButton"
                        data-income-id="${incomeSource.id}"
                    >
                        Edit Income Source
                    </button>
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

actionButton.addEventListener("click", () => {
    openIncomeSourceModal()
})

loadIncomeSources()