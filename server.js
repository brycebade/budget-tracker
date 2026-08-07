import "dotenv/config"
import express from "express"
import pg from "pg"
import cors from "cors"

const { Pool } = pg

const app = express()

app.use(cors())
app.use(express.json())

const PORT = 3000

const TEMP_USER_ID = "local-development-user"

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing from the .env file")
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

app.get("/api/accounts", async (request, response) => {
    try {
        const result = await pool.query(
            `
                SELECT 
                    accounts.id, 
                    accounts.name, 
                    accounts.type, 
                    accounts.opening_balance, 
                    accounts.created_at,

                    account_terms.account_id AS terms_account_id,
                    account_terms.apr,
                    account_terms.credit_limit,
                    account_terms.statement_closing_date,
                    account_terms.due_day,
                    account_terms.minimum_payment,
                    account_terms.scheduled_payment,
                    account_terms.payment_frequency
                FROM accounts
                LEFT JOIN account_terms
                    ON account_terms.account_id = accounts.id
                WHERE accounts.user_id = $1
                ORDER BY accounts.created_at DESC
            `,
            [TEMP_USER_ID]
        )

        const savedAccounts = result.rows.map((account) => {
            let details = null

            if (account.terms_account_id) {
                details = {
                    apr: account.apr === null
                        ? null 
                        : Number(account.apr),

                    creditLimit: 
                        account.credit_limit === null
                            ? null
                            : Number(account.credit_limit),

                    statementClosingDate:
                        account.statement_closing_date,

                    dueDay: account.due_day,

                    minimumPayment: 
                        account.minimum_payment === null
                        ? null
                        : Number(account.minimum_payment),

                    scheduledPayment:
                        account.scheduled_payment === null
                        ? null
                        : Number(account.scheduled_payment),
                    
                    nextDueDate: account.next_due_date,

                    paymentFrequency:
                        account.payment_frequency
                }
            }

            return {
                id: account.id,
                name: account.name,
                type: account.type,
                opening_balance: Number(account.opening_balance),
                created_at: account.created_at,
                details
            }
        })

        response.json(savedAccounts)
    } catch (error) {
        console.error("Failed to load accounts:", error)

        response.status(500).json({
            message: "Failed to load accounts"
        })
    }
})

app.get("/api/health", async (request, response) => {
    try {
        const result = await pool.query(
            "SELECT NOW() AS database_time"
        )

        response.json({
            message: "Backend and database are connected",
            databaseTime: result.rows[0].database_time
        })
    } catch (error) {
        console.error("Database connection failed:", error)

        response.status(500).json({
            message: "Database connection failed"
        })
    }
})

app.post("/api/accounts", async (request, response) => {
    const { name, type, openingBalance, details } = request.body
    
    if (!name || !type || openingBalance === undefined) {
        return response.status(400).json({
            message: "Name, type, and opening balance are required"
        })
    }

    const client = await pool.connect()

    try {
        await client.query("BEGIN")

        const accountResult = await client.query(
            `
                INSERT INTO accounts (
                    user_id,
                    name,
                    type,
                    opening_balance
                )
                VALUES ($1, $2, $3, $4)
                RETURNING 
                    id, 
                    name, 
                    type, 
                    opening_balance, 
                    created_at
            `,
            [
                TEMP_USER_ID,
                name,
                type,
                openingBalance
            ]
        )

        const savedAccount = accountResult.rows[0]
        let savedTerms = null

        if (details) {
            const termsResult = await client.query(
                `
                    INSERT INTO account_terms (
                        account_id,
                        apr,
                        credit_limit,
                        statement_closing_date,
                        due_day,
                        minimum_payment,
                        scheduled_payment,
                        payment_frequency
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING *
                `,
                [
                    savedAccount.id,
                    details.apr,
                    details.creditLimit ?? null,
                    details.statementClosingDate,
                    details.dueDay,
                    details.minimumPayment,
                    details.scheduledPayment,
                    details.paymentFrequency
                ]
            )

            savedTerms = termsResult.rows[0]
        }

        await client.query("COMMIT")

        let formattedTerms = null
        
        if (savedTerms) {
            formattedTerms = {
                apr: 
                    savedTerms.apr === null
                        ? null
                        : Number(savedTerms.apr),

                creditLimit: 
                    savedTerms.credit_limit === null
                    ? null
                    : Number(savedTerms.credit_limit),

                dueDay: savedTerms.due_day,
                paymentFrequency: savedTerms.payment_frequency,
                statementClosingDate: savedTerms.statement_closing_date,

                minimumPayment: 
                    savedTerms.minimum_payment === null
                        ? null
                        : Number(savedTerms.minimum_payment),

                scheduledPayment:
                    savedTerms.scheduled_payment === null
                        ? null
                        : Number(savedTerms.scheduled_payment)
            }
        }

        response.status(201).json({
            ...savedAccount,
            opening_balance: Number(savedAccount.opening_balance),
            details: formattedTerms
        })
    } catch (error) {
        await client.query("ROLLBACK")

        console.error("Failed to create account:", error)

        response.status(500).json({
            message: "Failed to create account"
        })
    } finally {
        client.release()
    }
})

app.post("/api/transactions", async (request, response) => {
    const {
        accountId,
        description,
        amount,
        type,
        category,
        date
    } = request.body

    if (
        !accountId ||
        !description ||
        amount === undefined ||
        !type ||
        !category ||
        !date
    ) {
        return response.status(400).json({
            message: "All transaction fields are required"
        })
    }

    try {
        const result = await pool.query(
            `
                INSERT INTO transactions (
                    user_id,
                    account_id,
                    description,
                    amount,
                    type,
                    category,
                    transaction_date
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING
                    id,
                    account_id,
                    description,
                    amount,
                    type,
                    category,
                    transaction_date::text AS transaction_date,
                    created_at
            `,
            [
                TEMP_USER_ID,
                accountId,
                description,
                amount,
                type,
                category,
                date
            ]
        )

        const savedTransaction = {
            ...result.rows[0],
            amount: Number(result.rows[0].amount)
        }

        response.status(201).json(savedTransaction)
    } catch (error) {
        console.error("Failed to create transaction:", error)

        response.status(500).json({
            message: "Failed to create transaction"
        })
    }
})

app.get("/api/transactions", async (request, response) => {
    try {
        const result = await pool.query(
            `
                SELECT
                    id,
                    account_id,
                    description,
                    amount,
                    type,
                    category,
                    transaction_date::text AS transaction_date,
                    created_at
                FROM transactions
                WHERE user_id = $1
                ORDER BY transaction_date DESC, created_at DESC
            `,
            [
                TEMP_USER_ID
            ]
        )

        const savedTransactions = result.rows.map((transaction) => ({
            ...transaction,
            amount: Number(transaction.amount)
        }))

        response.json(savedTransactions)
    } catch (error) {
        console.error("Failed to load transactions:", error)

        response.status(500).json({
            message: "Failed to load transactions"
        })
    }
})

app.put("/api/accounts/:id", async (request, response) => {
    const accountId = request.params.id

    const {
        name,
        type,
        details,
    } = request.body

    const client = await pool.connect()

    try {
        await client.query("BEGIN")

        const accountResult = await client.query(
            `
                UPDATE accounts
                SET
                    name = $1,
                    type = $2,
                WHERE id = $3
                    AND user_id = $4
                RETURNING
                    id,
                    name,
                    type,
                    opening_balance,
                    created_at
            `,
            [
                name,
                type,
                openingBalance,
                accountId,
                TEMP_USER_ID
            ]
        )

        const updatedAccount = accountResult.rows[0]

        let updatedTerms = null

        if (details) {
            const termsResult = await client.query(
                `
                    INSERT INTO account_terms (
                        account_id,
                        apr,
                        credit_limit,
                        statement_closing_date,
                        due_day,
                        minimum_payment,
                        scheduled_payment,
                        payment_frequency
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)

                    ON CONFLICT (account_id)
                    DO UPDATE SET
                        apr = EXCLUDED.apr,
                        credit_limit = EXCLUDED.credit_limit,
                        statement_closing_date = EXCLUDED.statement_closing_date,
                        due_day = EXCLUDED.due_day,
                        minimum_payment = EXCLUDED.minimum_payment,
                        scheduled_payment = EXCLUDED.scheduled_payment,
                        payment_frequency = EXCLUDED.payment_frequency

                    RETURNING *
                `,
                [
                    accountId,
                    details.apr ?? null,
                    details.creditLimit ?? null,
                    details.statementClosingDate ?? null,
                    details.dueDay ?? null,
                    details.minimumPayment ?? null,
                    details.scheduledPayment ?? null,
                    details.paymentFrequency ?? null
                ]
            )
            updatedTerms = termsResult.rows[0]
        }

        let formattedUpdatedTerms = null
        
        if (updatedTerms) {
            formattedUpdatedTerms = {
                apr: 
                    updatedTerms.apr === null
                        ? null
                        : Number(updatedTerms.apr),

                creditLimit:
                    updatedTerms.credit_limit === null
                        ? null
                        : Number(updatedTerms.credit_limit),

                dueDay: updatedTerms.due_day,
                paymentFrequency: updatedTerms.payment_frequency,
                statementClosingDate: updatedTerms.statement_closing_date,

                minimumPayment: 
                    updatedTerms.minimum_payment === null
                        ? null
                        : Number(updatedTerms.minimum_payment),

                scheduledPayment:
                    updatedTerms.scheduled_payment === null
                        ? null
                        : Number(updatedTerms.scheduled_payment)
            }
        }

        await client.query("COMMIT")

        response.json({
            ...updatedAccount,
            opening_balance: Number(updatedAccount.opening_balance),
            details: formattedUpdatedTerms
        })

    } catch (error) {
        await client.query("ROLLBACK")

        console.error("Failed to update account:", error)

        response.status(500).json({
            message: "Failed to update account"
        })
    } finally {
        client.release()
    }
})

app.delete("/api/accounts/:id", async (request, response) => {
    const accountId = request.params.id

    try {
        const result = await pool.query(
            `
                DELETE FROM accounts
                WHERE id = $1
                    AND user_id = $2
                RETURNING id
            `,
            [
                accountId,
                TEMP_USER_ID
            ]
        )

        response.json({
            deletedId: result.rows[0]?.id ?? null
        })
    } catch (error) {
        console.error("Failed to delete account:", error)

        response.status(500).json({
            message: "Failed to delete account"
        })
    }
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})