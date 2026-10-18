const accountModel = require("../models/account.model")
const transactionModel = require("../models/transactions.model")
const ledgerModel = require("../models/ledger.model")
const mongoose = require("mongoose")

async function createTransactionController(req,res){

    // validate request 

    const{fromAccount,toAccount,amount,idempotencyKey}=req.body

    if(!fromAccount||!toAccount||!amount||!idempotencyKey){
        return res.status(400).json({
            message:"forAccount,toAccount,amount and IdempotencyKey are required"
        })

    }

    const fromUserAccount = await accountModel.findOne({
        _id:fromAccount,
    })
    const toUserAccount = await accountModel.findOne({
        _id:toAccount,
    })

    if(!fromUserAccount||!toUserAccount){
        return res.status(400).json({
            message:"Invalid fromUserAccount or toUserAccount"
        })
    }

    // validate idempotency key...

    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey:idempotencyKey
    })

    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status === "COMPLETED"){
            return res.status(200).json({
                message:"Transaction is already processed",
                transaction:isTransactionAlreadyExists
            })
        }

        if(isTransactionAlreadyExists.status === "PENDING"){
            return res.status(200).json({
                message:"Transaction is still proccessing"
            })
        }

        if(isTransactionAlreadyExists.status === "FAILED"){
            return res.status(500).json({
                message:"Transaction processing failed ,Please retry"
            })
        }

        if(isTransactionAlreadyExists.status === "REVERSED"){
           return res.status(500).json({
                message:"Transaction was reversed,Please retry"
            })
        }
    }

    // Check Account Status...

    if(fromUserAccount.status !== "ACTIVE"||toUserAccount.status !== "ACTIVE"){
        return res.status(400).json({
            message:"Both fromAccount and toAccount must be ACTIVE to process transaction"
        })

    }

    // Derive Sender balance from ledger

    const balance = await fromUserAccount.getBalance()

    if(balance<amount){
        return res.status(400).json({
            message:`Insufficient Balance.Current Balance is ${balance}.Requested amount is ${amount}`
        })
    }

    // Create Transaction (PENDING)

    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = await transactionModel.create({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status:"PENDING" 
    },{session})

// Create DEBIT ledger Entry

    const debitLedgerEntry = await ledgerModel.create([{
        account:fromAccount,
        amount:amount,
        transaction:transaction._id,
        type:"DEBIT"
    }],{session})

    // Create CREDIT ledger Entry

    const creditLedgerEntry = await ledgerModel.create([{
        account:toAccount,
        amount:amount,
        transaction:transaction._id,
        type:"CREDIT"
    }],{session})

    // Mark Transaction Completed

    transaction.status = "COMPLETED"
    await transaction.save({session})

    // Commit mongoDB session

    await session.commitTransaction()
    session.endSession()

}

/* CREATE INITIAL FUNDS TRANSACTIONS */

async function initialTransactionController(req,res){

    const{toAccount,amount,idempotencyKey} = req.body 

    if(!toAccount||!amount||!idempotencyKey){
        return res.status(400).json({
            message:"toAccount, Amount or idempotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id:toAccount
    })

    if(!toUserAccount){
        return res.status(400).json({
            message:"Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        systemUser:true,
        user:req.user._id
    })

    if(!fromUserAccount){
        return res.status(400).json({
            message:"System user not found"
        })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transactionModel({
        fromAccount:fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status:"PENDING"
    })

    const debitLedgerEntry = await ledgerModel.create([{
        account:fromUserAccount._id,
        amount:amount,
        transaction:transaction._id,
        type:"DEBIT"
    }],{session})

    const creditLedgerEntry = await ledgerModel.create([{
        account:toAccount,
        amount:amount,
        transaction:transaction._id,
        type:"CREDIT"
    }],{session})

    transaction.status = "COMPLETED"
     await transaction.save({session})

     await session.commitTransaction()
     session.endSession()

     return res.status(201).json({
        message:"Initaial fundds Transaction completed successfully...",
        transaction:transaction
     })




}

module.exports = {
    createTransactionController,initialTransactionController
}