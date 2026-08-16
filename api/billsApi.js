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