const isCodespaces = window.location.hostname.endsWith(".app.github.dev")

const ACCOUNTS_URL = isCodespaces
    ? `https://${window.location.hostname.replace("-5000.", "-3000.")}/api/accounts`
    : "http://localhost:3000/api/accounts"

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

export const updateAccount = async (accountId, accountData) => {
    const response = await fetch(`${ACCOUNTS_URL}/${accountId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(accountData)
    })

    if (!response.ok) {
        throw new Error("Failed to update account")
    }

    return response.json()
}

export const deleteAccount = async (accountId) => {
    const response = await fetch(`${ACCOUNTS_URL}/${accountId}`, {
        method: "DELETE"
    })

    if (!response.ok) {
        throw new Error("Failed to delete account")
    }

    return response.json()
}