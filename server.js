import "dotenv/config"
import express from "express"
import pg from "pg"
import cors from "cors"

const { Pool } = pg

const app = express()

app.use(cors({
    origin: "http://127.0.0.1:5500"
}))

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
        const result = await pool.query(`
            SELECT id, name, type, opening_balance, created_at
            FROM accounts
            ORDER BY created_at DESC
        `)

        const savedAccounts = result.rows.map((account) => ({
            ...account,
            opening_balance: Number(account.opening_balance)
        }))

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

        response.status(201).json({
            ...savedAccount,
            opening_balance: Number(savedAccount.opening_balance),
            details: savedTerms
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

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})