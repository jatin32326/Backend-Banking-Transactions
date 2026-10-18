const express = require("express")
const Router = express.Router()
const authMiddleware = require("../middleware/auth.middleware")
const {
    createAccountController,
    getUserAccountController,
    getAccountBalanceController
} = require("../controller/account.controller");


const accountRouter = Router


accountRouter.post("/",authMiddleware,createAccountController)

// Get all account of the logged-in user

accountRouter.get("/",authMiddleware,getUserAccountController)

// Get /api/account/balance/:accountId

accountRouter.get("/balance/:accountId",authMiddleware,getAccountBalanceController)


module.exports = accountRouter