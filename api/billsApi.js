const BILLS_URL = "http://localhost:3000/api/bills"

export const getBills = async () => {
    const response = await fetch(BILLS_URL)

    if (!response.ok) {
        throw new Error("Failed to load bills")
    }

    return response.json()
}