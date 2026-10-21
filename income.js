import { renderLayout } from "./components/layout.js"
import { getIncomeSources } from "./api/incomeSourcesApi.js"

renderLayout({
    title: "Income",
    activePage: "income",
    actionLabel: "Add Income Source +"
})

const incomeSourcesContainer = document.getElementById("incomeSourcesContainer")

const incomeSources = []

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
                </div>
            </div>
        `
    })
}

const loadIncomeSources = async () => {
    try {
        const savedIncomeSources = await getIncomeSources()

        incomeSources.push(...savedIncomeSources)

        renderIncomeSources()
    } catch (error) {
        console.error("Income sources could not be loaded:", error)
    }
}

loadIncomeSources()