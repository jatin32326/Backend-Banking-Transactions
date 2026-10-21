# Backend Banking Transactions

A secure banking backend API built with Node.js, Express, and MongoDB for managing accounts, balances, ledger entries, and money transfers.

## Overview

This project is designed to handle the core backend logic for a simple banking system. It supports:

- User registration and login
- Account creation
- Balance checking
- Deposit and withdrawal operations
- Fund transfer between accounts
- Ledger-based financial tracking
- MongoDB transaction safety for money movement
- JWT-based authentication

This backend follows a ledger-based approach, where account balances are derived from debit and credit entries rather than storing a fragile single balance value without audit records.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- dotenv
- cookie-parser

## Features

- User authentication and authorization
- Create user bank accounts
- View account details
- Check account balance
- Perform money transfers
- Track transaction history with ledger entries
- Prevent duplicate transactions using idempotency keys
- Maintain immutable ledger records for audits
- MongoDB transactions for atomic updates

## Project Structure

```bash
backend-banking-transactions/
├── app.js
├── .gitignore
├── package.json
├── package-lock.json
├── config/
│   └── db.js
├── src/
│   ├── controller/
│   │   ├── account.controller.js
│   │   ├── transaction.controller.js
│   │   └── user.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── authSystemUser.middleware.js
│   ├── models/
│   │   ├── account.model.js
│   │   ├── blackList.model.js
│   │   ├── ledger.model.js
│   │   ├── transactions.model.js
│   │   └── user.model.js
│   └── routes/
│       ├── account.router.js
│       ├── auth.router.js
│       └── transaction.router.js
└── README.md
```

## Database Models

### User Model
```js
{
  email: String,
  name: String,
  password: String,
  systemUser: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Account Model
```js
{
  user: ObjectId,
  status: "ACTIVE" | "FROZEN" | "CLOSED",
  currency: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Model
```js
{
  fromAccount: ObjectId,
  toAccount: ObjectId,
  amount: Number,
  status: "PENDING" | "COMPLETED" | "FAILED" | "REVERSED",
  idempotencyKey: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Ledger Model
```js
{
  account: ObjectId,
  amount: Number,
  transaction: ObjectId,
  type: "DEBIT" | "CREDIT",
  createdAt: Date
}
```

## API Routes

### Authentication
```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

### Accounts
```http
POST /api/account
GET /api/account
GET /api/account/balance/:accountId
```

### Transactions
```http
POST /api/transaction
POST /api/transaction/system/initial-funds
```

## Example Request: Register User

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

## Example Request: Create Account

```http
POST /api/account
Content-Type: application/json
Authorization: Bearer <token>
```

```json
{
  "user": "64a8f0d8e660ca2af4f8d91e",
  "currency": "INR",
  "status": "ACTIVE"
}
```

## Example Request: Transfer Funds

```http
POST /api/transaction
Content-Type: application/json
Authorization: Bearer <token>
```

```json
{
  "fromAccount": "64a8f0f9d2ce2e07671d25a1",
  "toAccount": "64a8f101d2ce2e07671d25a2",
  "amount": 500,
  "idempotencyKey": "txn-1001"
}
```

## Transaction Flow

The transaction flow in this project is:

1. Validate sender and recipient accounts
2. Check account status
3. Verify amount is valid
4. Check sender's available balance
5. Prevent duplicate requests using idempotency key
6. Start MongoDB transaction session
7. Create DEBIT ledger entry for sender
8. Create CREDIT ledger entry for receiver
9. Update transaction status to COMPLETED
10. Commit transaction

If any step fails, the transaction is not finalized.

## Balance Logic

Balance is calculated from ledger entries:

- CREDIT entries increase balance
- DEBIT entries decrease balance

This ensures all transactions are traceable and auditable.

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/banking_db
JWT_SECRET=your_super_secret_key
```

## Installation

```bash
npm install
```

## Run the Project

```bash
node app.js
```

If you are using nodemon:

```bash
npx nodemon app.js
```

## Notes

This project is a solid backend foundation for a banking ledger system. It already includes the essential financial logic for:

- user management
- account management
- transaction processing
- ledger tracking

For production use, you can extend it with:

- admin dashboard
- bank statement generation
- deposit/withdraw APIs
- KYC verification
- email/SMS notifications
- payment gateway integration
- transaction limits
- role-based access control
- audit logs
- Redis caching
- Docker deployment

## Security Best Practices

- Hash passwords before saving
- Use JWT authentication for protected routes
- Validate all client input
- Prevent negative balances
- Use MongoDB transactions for credits and debits
- Keep sensitive values in `.env`
- Use HTTPS in production
- Add rate limiting and request validation later

## Author

Your Name  
GitHub: @jatin32326
