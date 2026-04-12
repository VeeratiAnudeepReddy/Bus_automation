# 🚀 Quick Start Guide

## Prerequisites
- Node.js installed
- Internet connection (for MongoDB Atlas)

## Setup & Run

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

   The server will start on **http://localhost:5001**

   You should see:
   ```
   🚀 Server running on port 5001
   ✅ Connected to MongoDB
   ```

## Testing the API

### Option 1: Using cURL

**1. Register a user:**
```bash
curl -X POST http://localhost:5001/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe"}'
```

**2. Recharge wallet (replace USER_ID):**
```bash
curl -X POST http://localhost:5001/api/recharge \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","amount":100}'
```

**3. Generate ticket (replace USER_ID):**
```bash
curl -X POST http://localhost:5001/api/generate-ticket \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID"}'
```

**4. Validate ticket (replace TICKET_ID):**
```bash
curl -X POST http://localhost:5001/api/validate \
  -H "Content-Type: application/json" \
  -d '{"ticketId":"TICKET_ID"}'
```

### Option 2: Using Postman

1. Import the collection file: `QR_Bus_Ticketing.postman_collection.json`
2. Run the requests in order (1-7)
3. Replace placeholder values with actual IDs from responses

## Stopping the Server

Press `Ctrl + C` in the terminal where the server is running

## Troubleshooting

**Port already in use?**
- Change PORT in `config.js` to another port (e.g., 5002)

**MongoDB connection error?**
- Check your internet connection
- Verify MongoDB Atlas credentials in `config.js`

## Project Structure
```
backend/
├── models/              # Database schemas
├── controllers/         # Business logic
├── routes/              # API routes
├── config.js           # Configuration
├── server.js           # Entry point
└── package.json        # Dependencies
```

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/recharge` | Recharge wallet |
| POST | `/api/generate-ticket` | Generate QR ticket |
| POST | `/api/validate` | Validate ticket |

## Next Steps

1. Test all endpoints using Postman or cURL
2. Check MongoDB Atlas dashboard to see data
3. Integrate with frontend application

---

**Need help?** Check the main README.md for detailed API documentation.
