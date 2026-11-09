import { API_BASE_URL } from "./apiConfig.js"

const INCOME_SOURCES_URL = 
    `${API_BASE_URL}/api/income-sources`

export const getIncomeSources = async () => {
    const response = await fetch(INCOME_SOURCES_URL)

    if (!response.ok) {
        throw new Error("Failed to load income sources")
    }

    return response.json()
}

export const updateIncomeSource = async (id, incomeSourceData) => {
    const response = await fetch(`${INCOME_SOURCES_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(incomeSourceData)
    })

    if (!response.ok) {
        throw new Error("Failed to update income source")
    }

    return response.json()
}

export const deactivateIncomeSources = async (id) => {
    const response = await fetch(
        `${INCOME_SOURCES_URL}/${id}/deactivate`,
        {
            method: "PUT"
        }
    )

    if (!response.ok) {
        throw new Error("Failed to deactivate income source")
    }

    return response.json()
}

export const reactivateIncomeSource = async (id) => {
    const response = await fetch(
        `${INCOME_SOURCES_URL}/${id}/reactivate`,
        {
            method: "PUT"
        }
    )

    if (!response.ok) {
        throw new Error("Failed to reactivate income source")
    }

    return response.json()
}

export const createIncomeSource = async (incomeSourceData) => {
    const response = await fetch(INCOME_SOURCES_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(incomeSourceData)
    })

    if (!response.ok) {
        throw new Error("Failed to create income source")
    }

    return response.json()
}