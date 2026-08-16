import { API_BASE_URL } from "./apiConfig.js"

const TRANSACTION_URL = `${API_BASE_URL}/api/transactions`

export const createTransaction = async (transactionData) => {
    const response = await fetch(TRANSACTION_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(transactionData)
    })

    if (!response.ok) {
        throw new Error("Failed to create transaction")
    }

    return response.json()
}

export const getTransactions = async () => {
    const response = await fetch(TRANSACTION_URL)

    if (!response.ok) {
        throw new Error("Failed to load transactions")
    }

    return response.json()
}