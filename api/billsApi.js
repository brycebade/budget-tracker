const BILLS_URL = "http://localhost:3000/api/bills"

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