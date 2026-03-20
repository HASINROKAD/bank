# Bank Ledger Service

Node.js + Express backend for a mini digital banking system with transactional transfers, idempotency, and double-entry ledgering.

## Learning Project Notice

This project is built for learning and practice.

- It focuses on backend concepts such as auth, ledger design, and transaction safety.
- It is not production-ready in its current form.
- Some responses, edge-case handling, and validation are intentionally minimal for educational clarity.

## Choose Your View

- [Portfolio View (Recruiter Friendly)](#portfolio-view-recruiter-friendly)
- [Team Onboarding View (Operational)](#team-onboarding-view-operational)
- [API Consumer View (Endpoint First)](#api-consumer-view-endpoint-first)

---

## Portfolio View (Recruiter Friendly)

### Snapshot

This project demonstrates backend engineering fundamentals for financial systems:

- Authentication with JWT and token invalidation
- Ledger-based accounting model (credit/debit)
- Idempotent payment flow to prevent duplicate money movement
- MongoDB transaction/session usage for atomic transfer writes
- Email notifications for major user events

### Why This Project Is Valuable For Learning

- Correctness practice: balance is derived from immutable ledger entries, not mutable account fields.
- Failure-safety practice: transfer writes use a MongoDB session and rollback path.
- Retry-safety practice: idempotency key support prevents accidental duplicate transfers.
- Security practice: logout token blacklist and protected routes via middleware.

### Core Stack

- Runtime: Node.js
- Framework: Express
- Database: MongoDB + Mongoose
- Auth: JWT + cookie or Bearer token
- Messaging: Nodemailer (Gmail App Password)

### Architecture At A Glance

```text
Client
	-> Auth Routes (/api/auth)
	-> Account Routes (/api/accounts)
	-> Transaction Routes (/api/transactions)

Transaction Controller
	-> Validate request + idempotency
	-> Open MongoDB session
	-> Create transaction(PENDING)
	-> Create DEBIT ledger
	-> Create CREDIT ledger
	-> Mark transaction(COMPLETED)
	-> Commit or rollback
```

### Repository Structure

```text
.
├─ server.js
├─ src/
│  ├─ app.js
│  ├─ config/db.js
│  ├─ controllers/
│  ├─ middleware/
│  ├─ models/
│  ├─ routes/
│  └─ services/email.service.js
└─ package.json
```

---

## Team Onboarding View (Operational)

### Quick Start Checklist

- [ ] Install Node.js 18+
- [ ] Install MongoDB (replica set enabled for transactions)
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Create `.env` from template below
- [ ] Start app with `npm run dev`
- [ ] Verify `GET /` returns `Ledger Service is up and running`

### Environment Setup

Create `.env` in project root:

```env
MONGO_URI=mongodb://127.0.0.1:27017/bank
JWT_SECRET=replace_with_strong_secret

EMAIL_USER=your_email@gmail.com
APP_PASSWORD=your_gmail_app_password

NODE_ENV=development
```

Notes:

- `MONGO_URI` must target MongoDB deployment with transaction support.
- For Gmail, use App Password, not account login password.

### Run Commands

```bash
npm install
npm run dev
```

Production mode:

```bash
npm start
```

### Operational Flow Checklist

#### New Developer Sanity Checks

- [ ] Register user: `POST /api/auth/register`
- [ ] Login user: `POST /api/auth/login`
- [ ] Create account: `POST /api/accounts`
- [ ] Fetch accounts: `GET /api/accounts`
- [ ] Fetch balance: `GET /api/accounts/balance/:accountId`

#### Transfer Flow Checks

- [ ] Create 2 user accounts (sender/receiver)
- [ ] Fund sender using system route
- [ ] Create transfer with unique `idempotencyKey`
- [ ] Re-send same request and verify idempotent response

### System User Setup (for initial-funds route)

`POST /api/transactions/system/initial-funds` requires authenticated user where `systemUser=true`.

Example in Mongo shell:

```javascript
db.users.updateOne(
  { email: "admin@bank.local" },
  { $set: { systemUser: true } },
);
```

### Current Scripts

- `npm run dev`: start with nodemon
- `npm start`: run with node
- `npm test`: placeholder script

### Known Operational Notes

- Logout token is blacklisted and expires automatically after 3 days.
- Protected routes accept cookie token or Bearer token.
- No formal validation library is wired yet (Joi/Zod/etc.).

---

## API Consumer View (Endpoint First)

Base URL:

```text
http://localhost:3000
```

Auth model:

- Token returned in response body as `token`
- Token also set as cookie `token`
- Use either cookie auth or `Authorization: Bearer <token>`

### Endpoint Index

| Method | Endpoint                                 | Auth        | Purpose                    |
| ------ | ---------------------------------------- | ----------- | -------------------------- |
| GET    | `/`                                      | No          | Health check               |
| POST   | `/api/auth/register`                     | No          | Register user              |
| POST   | `/api/auth/login`                        | No          | Login user                 |
| POST   | `/api/auth/logout`                       | Optional    | Logout and blacklist token |
| POST   | `/api/accounts`                          | Yes         | Create account             |
| GET    | `/api/accounts`                          | Yes         | List user accounts         |
| GET    | `/api/accounts/balance/:accountId`       | Yes         | Get account balance        |
| POST   | `/api/transactions`                      | Yes         | Create transfer            |
| POST   | `/api/transactions/system/initial-funds` | System user | Seed/fund account          |

### Request/Response Contracts

#### Register

`POST /api/auth/register`

Request:

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret123"
}
```

Success: `201 Created`

```json
{
  "user": {
    "_id": "...",
    "email": "alice@example.com",
    "name": "Alice"
  },
  "token": "jwt_token_here"
}
```

#### Login

`POST /api/auth/login`

Request:

```json
{
  "email": "alice@example.com",
  "password": "secret123"
}
```

Success: `200 OK`

#### Logout

`POST /api/auth/logout`

Success: `200 OK`

```json
{
  "message": "User logged out successfully"
}
```

#### Create Account

`POST /api/accounts`

Headers:

```text
Authorization: Bearer <TOKEN>
```

Success: `201 Created`

#### Get User Accounts

`GET /api/accounts`

Success: `200 OK`

```json
{
  "accounts": []
}
```

#### Get Balance

`GET /api/accounts/balance/:accountId`

Success: `200 OK`

```json
{
  "accounId": "<account_id>",
  "balance": 0
}
```

#### Create Transaction

`POST /api/transactions`

Request:

```json
{
  "fromAccount": "<sender_account_id>",
  "toAccount": "<receiver_account_id>",
  "amount": 500,
  "idempotencyKey": "txn-2026-03-20-0001"
}
```

Success: `201 Created`

```json
{
  "message": "Transaction completed successfully",
  "transaction": {
    "_id": "...",
    "status": "PENDING"
  }
}
```

Idempotency behavior:

- Same `idempotencyKey` + already completed transaction -> `200` with existing transaction
- Same `idempotencyKey` + pending transaction -> `200` processing message

#### Initial Funds (System User)

`POST /api/transactions/system/initial-funds`

Request:

```json
{
  "toAccount": "<receiver_account_id>",
  "amount": 1000,
  "idempotencyKey": "init-2026-03-20-0001"
}
```

Success: `201 Created`

### cURL Examples

Register:

```bash
curl -X POST http://localhost:3000/api/auth/register \
	-H "Content-Type: application/json" \
	-d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'
```

Login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"alice@example.com","password":"secret123"}'
```

Create account:

```bash
curl -X POST http://localhost:3000/api/accounts \
	-H "Authorization: Bearer <TOKEN>"
```

Create transfer:

```bash
curl -X POST http://localhost:3000/api/transactions \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer <TOKEN>" \
	-d '{"fromAccount":"<FROM_ID>","toAccount":"<TO_ID>","amount":100,"idempotencyKey":"txn-001"}'
```

---

## Future Additions

- OpenAPI/Swagger document generation
- Request schema validation
- Automated tests (unit + integration)
- Docker and CI pipeline

## Current Scope

This codebase is intentionally scoped for learning core backend patterns.

- Includes: authentication, account creation, ledger-based balance, idempotent transfers.
- Not fully covered yet: comprehensive validation, full error taxonomy, observability, and production hardening.
