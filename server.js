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
                    account_terms.statement_closing_date,
                    account_terms.due_day,
                    account_terms.minimum_payment,
                    account_terms.scheduled_payment,
                    account_terms.next_due_date::text AS next_due_date,
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
                        statement_closing_date,
                        due_day,
                        minimum_payment,
                        scheduled_payment,
                        next_due_date,
                        payment_frequency
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING *
                `,
                [
                    savedAccount.id,
                    details.apr,
                    details.statementClosingDate,
                    details.dueDay,
                    details.minimumPayment,
                    details.scheduledPayment,
                    details.nextDueDate,
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
        openingBalance,
        details,
    } = request.body

    console.log({
        accountId,
        name,
        type,
        openingBalance,
        details
    })

    console.log("Account to update:", accountId)

    response.json({
        message: "Update route reached"
    })
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})