export const getTransactionBalanceChange = (account, transaction) => {
    if (
        account.type === "checking" ||
        account.type === "savings"
    ) {
        if (
            transaction.type === "income" ||
            transaction.type === "transfer_in" ||
            transaction.type === "refund"
        ) {
            return transaction.amount
        }

        if (
            transaction.type === "expense" ||
            transaction.type === "transfer_out" ||
            transaction.type === "payment" ||
            transaction.type === "fee"
        ) {
            return -transaction.amount
        }
    }

    if (account.type === "credit_card") {
        if (
            transaction.type === "expense" ||
            transaction.type === "interest" ||
            transaction.type === "fee"
        ) {
            return transaction.amount
        }

        if (
            transaction.type === "payment" ||
            transaction.type === "refund"
        ) {
            return -transaction.amount
        }
    }

    if (account.type === "loan") {
        if (
            transaction.type === "interest" ||
            transaction.type === "fee"
        ) {
            return transaction.amount
        }

        if (transaction.type === "payment") {
            return -transaction.amount
        }
    }

    return 0
}

export const calculateCurrentBalance = (account, accountTransactions) => {
    let balance = account.balance

    accountTransactions.forEach((transaction) => {
        balance += getTransactionBalanceChange(account, transaction)
    })

    return balance
}