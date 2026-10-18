const express = require("express")
const authMiddleware = require("../middleware/auth.middleware.js");

const  authsystemUser = require("../middleware/authSystemUser.middleware.js");

const { createTransactionController, initialTransactionController } = require("../controller/transaction.controller.js")
const Router = express.Router()

const transactionRouter = Router

transactionRouter.post("/",authMiddleware,createTransactionController)

/* POST/api/transaction/system/initial-funds 
-Create initial funds transfer from system user*/

transactionRouter.post("/system/initial-funds",authsystemUser,initialTransactionController)




module.exports = transactionRouter