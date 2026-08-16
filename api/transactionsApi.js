const isCodespaces = window.location.hostname.endsWith(".app.github.dev")
const isGitHubPages = window.location.hostname.endsWith(".github.io")

const TRANSACTION_URL = isCodespaces
    ? `https://${window.location.hostname.replace("-5000.", "-3000.")}/api/transactions`
    : isGitHubPages
        ? "https://budget-tracker-api-i09z.onrender.com/api/transactions"
        : "http://localhost:3000/api/transactions"

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