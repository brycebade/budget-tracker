import "dotenv/config"
import express from "express"
import pg from "pg"

const { Pool } = pg

const app = express()
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

        response.json(result.rows)
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
    const { name, type, openingBalance } = request.body
    
    if (!name || !type || openingBalance === undefined) {
        return response.status(400).json({
            message: "Name, type, and opening balance are required"
        })
    }

    try {
        const result = await pool.query(
            `
                INSERT INTO accounts (
                    user_id,
                    name,
                    type,
                    opening_balance
                )
                VALUES ($1, $2, $3, $4)
                RETURNING id, name, type, opening_balance, created_at
            `,
            [
                TEMP_USER_ID,
                name,
                type,
                openingBalance
            ]
        )

        const savedAccounts = {
            ...result.rows[0],
            opening_balance: Number(result.rows[0].opening_balance)
        }

        response.status(201).json(savedAccount)
    } catch (error) {
        console.error("Failed to create account:", error)

        response.status(500).json({
            message: "Failed to create account"
        })
    }
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})