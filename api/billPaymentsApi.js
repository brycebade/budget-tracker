import { API_BASE_URL } from "./apiConfig.js"

const BILL_PAYMENTS_URL = `${API_BASE_URL}/api/bill-payments`

export const getBillPayments = async () => {
    const response = await fetch(BILL_PAYMENTS_URL)

    if (!response.ok) {
        throw new Error("Failed to load bill payments")
    }

    return response.json()
}

export const createBillPayment = async (paymentData) => {
    const response = await fetch(BILL_PAYMENTS_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(paymentData)
    })

    if (!response.ok) {
        throw new Error("Failed to create bill payment")
    }

    return response.json()
}