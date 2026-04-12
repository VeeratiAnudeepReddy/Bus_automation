# QR Code-based Public Bus Ticketing System - Backend

A complete, production-quality backend for a QR Code-based public bus ticketing system.

## 🚀 Features

- User registration
- Wallet recharge (mock)
- QR-based ticket generation
- Ticket validation via scanning
- Complete validation logging

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB Atlas (Cloud Database)
- Mongoose
- UUID (for ticket IDs)
- QRCode (for QR generation)

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. The project is configured to use MongoDB Atlas cloud database

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on **http://localhost:5001**

## 📡 API Endpoints

All endpoints are prefixed with `/api`

### 1. Register User
**POST** `/api/register`

**Request:**
```json
{
  "name": "John"
}
```

**Response:**
```json
{
  "_id": "...",
  "name": "John",
  "balance": 0,
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### 2. Recharge Wallet
**POST** `/api/recharge`

**Request:**
```json
{
  "userId": "...",
  "amount": 100
}
```

**Response:**
```json
{
  "_id": "...",
  "name": "John",
  "balance": 100,
  "updatedAt": "..."
}
```

---

### 3. Generate Ticket
**POST** `/api/generate-ticket`

**Request:**
```json
{
  "userId": "..."
}
```

**Response:**
```json
{
  "ticketId": "uuid-string",
  "qr": "data:image/png;base64,..."
}
```

**Business Logic:**
- Deducts fare (₹10) from user balance
- Returns 404 if user not found
- Returns 400 if insufficient balance
- Generates unique UUID-based ticket
- Creates QR code containing only the ticketId

---

### 4. Validate Ticket
**POST** `/api/validate`

**Request:**
```json
{
  "ticketId": "uuid-string"
}
```

**Response:**
```json
{
  "status": "VALID"
}
```

**Possible Status Values:**
- `VALID` - Ticket exists and not yet used
- `INVALID` - Ticket not found
- `ALREADY_USED` - Ticket already validated

**Note:** Every validation attempt is logged in the database

---

## 🧪 Testing with Postman

**Base URL:** `http://localhost:5001/api`

Test the following scenarios:

1. ✅ **Register a user**
   - POST `/api/register`
   - Body: `{"name": "John Doe"}`

2. ✅ **Recharge wallet with ₹100**
   - POST `/api/recharge`
   - Body: `{"userId": "<user_id_from_step_1>", "amount": 100}`

3. ✅ **Generate ticket** (balance should decrease by ₹10)
   - POST `/api/generate-ticket`
   - Body: `{"userId": "<user_id>"}`

4. ✅ **Validate ticket first time** → `VALID`
   - POST `/api/validate`
   - Body: `{"ticketId": "<ticketId_from_step_3>"}`

5. ✅ **Validate same ticket again** → `ALREADY_USED`
   - POST `/api/validate`
   - Body: `{"ticketId": "<same_ticketId>"}`

6. ✅ **Validate random ticket ID** → `INVALID`
   - POST `/api/validate`
   - Body: `{"ticketId": "random-uuid-here"}`

7. ✅ **Try generating ticket with insufficient balance** → Error
   - POST `/api/generate-ticket`
   - Body: `{"userId": "<user_id_with_low_balance>"}`

---

## 📊 Database Collections

### Users
- name
- balance
- timestamps

### Tickets
- ticketId (UUID, indexed)
- userId (ref to User)
- used (boolean)
- timestamps

### ValidationLogs
- ticketId (indexed)
- status (VALID/INVALID/ALREADY_USED)
- timestamps

## ⚙️ Configuration

Edit `config.js` to change:
- MongoDB URI
- Server PORT (currently 5001)
- Ticket FARE (currently ₹10)

## 🎯 Business Rules

- Fixed fare: ₹10 per ticket
- QR code contains only ticketId (no metadata)
- Each ticket can be used only once
- All validation attempts are logged
- No authentication required (for demo purposes)

## 📁 Project Structure

```
backend/
├── models/
│   ├── User.js
│   ├── Ticket.js
│   └── ValidationLog.js
├── controllers/
│   ├── authController.js
│   ├── walletController.js
│   ├── ticketController.js
│   └── validationController.js
├── routes/
│   ├── authRoutes.js
│   ├── walletRoutes.js
│   ├── ticketRoutes.js
│   └── validationRoutes.js
├── config.js
├── server.js
└── package.json
```

## 🔒 Security Note

This is a demo system. For production:
- Add authentication (JWT)
- Add rate limiting
- Add input validation/sanitization
- Use environment variables for config
- Add API documentation (Swagger)
- Implement proper error handling
- Add request logging

## 📝 License

ISC

