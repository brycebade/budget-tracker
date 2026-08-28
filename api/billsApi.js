import { API_BASE_URL } from "./apiConfig.js"

const BILLS_URL = `${API_BASE_URL}/api/bills`

export const getBills = async () => {
    const response = await fetch(BILLS_URL)

    if (!response.ok) {
        throw new Error("Failed to load bills")
    }

    return response.json()
}

export const createBill = async (billData) => {
    const response = await fetch(BILLS_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(billData)
    })

    if (!response.ok) {
        throw new Error("Failed to create bill")
    }

    return response.json()
}

export const updateBill = async (billId, billData) => {
    const response = await fetch(`${BILLS_URL}/${billId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(billData)
    })

    if (!response.ok) {
        throw new Error("Failed to update bill")
    }

    return response.json()
}

export const deactivateBill = async (billId) => {
    const response = await fetch(
        `${BILLS_URL}/${billId}/deactivate`,
        {
            method: "PUT"
        }
    )

    if (!response.ok) {
        throw new Error("Failed to deactivate bill")
    }

    return response.json()
}

export const reactivateBill = async (billId) => {
    const response = await fetch(
        `${BILLS_URL}/${billId}/reactivate`,
        {
            method: "PUT"
        }
    )

    if (!response.ok) {
        throw new Error("Failed to reactivate bill")
    }

    return response.json()
}