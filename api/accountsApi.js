const ACCOUNTS_URL = "http://localhost:3000/api/accounts"

export const createAccount = async (accountData) => {
    const response = await fetch(ACCOUNTS_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(accountData)
    })

    if (!response.ok) {
        throw new Error("Failed to create account")
    }

    return response.json()
}

export const getAccounts = async () => {
    const response = await fetch(ACCOUNTS_URL)

    if (!response.ok) {
        throw new Error("failed to load accounts")
    }

    return response.json()
}