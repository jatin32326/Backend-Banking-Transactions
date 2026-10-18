const express = require("express")
const app = express()
require("dotenv").config()
const cookieParser = require("cookie-parser")

const connectDB = require("./config/db.js")
const authRouter = require("./src/routes/auth.router.js")
const accountRouter = require("./src/routes/account.router.js")
const transactionRouter = require("./src/routes/transaction.router.js")
connectDB()

const port = process.env.PORT
app.use(express.json())
app.use(cookieParser())


app.use("/api/auth",authRouter)
app.use("/api/account",accountRouter)
app.use("/api/transaction",transactionRouter)

app.get("/",(req,res)=>{
 res.send("Backend-Banking Transaction(Banking-Ledger) is Live")   
})
app.listen(port,()=>{
    console.log(`Server is listening on Port ${port}`)
})

