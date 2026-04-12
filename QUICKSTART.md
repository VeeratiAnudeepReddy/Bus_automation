# 🚀 Quick Start - Bus QR Ticketing System

## ⚡ Start in 3 Steps

### 1. Start Backend
```bash
cd backend
npm start
```
✅ Backend running on **http://localhost:5001**

### 2. Start Frontend  
```bash
cd frontend
npm run dev
```
✅ Frontend running on **http://localhost:3000**

### 3. Test the App
Open **http://localhost:3000** in your browser

---

## 🎯 First-Time Setup

If you haven't installed dependencies:

```bash
# Backend
cd backend
npm install
npm start

# Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

---

## 🧪 Quick Test Flow

1. **Get a User ID**:
   ```bash
   curl -X POST http://localhost:5001/api/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User"}'
   ```
   Copy the `_id` from the response.

2. **Recharge Wallet** (replace USER_ID):
   ```bash
   curl -X POST http://localhost:5001/api/recharge \
     -H "Content-Type: application/json" \
     -d '{"userId":"USER_ID","amount":100}'
   ```

3. **Generate Ticket**:
   - Go to http://localhost:3000
   - Enter your User ID
   - Click "Generate Ticket"
   - QR code appears!

4. **Scan Ticket**:
   - Go to http://localhost:3000/scanner
   - Click "Start Scanner"
   - Allow camera access
   - Scan the QR code
   - See validation result!

---

## 📊 What's Included

### Backend (Port 5001)
- 9 API endpoints
- MongoDB connected
- Full validation system
- User & wallet management

### Frontend (Port 3000)
- Modern premium UI
- QR code generator
- Real-time scanner
- Color-coded validation

---

## 🎨 Features

✅ Generate QR tickets  
✅ Scan with camera  
✅ Instant validation  
✅ Mobile responsive  
✅ Premium design  

---

## 📝 Documentation

- **Full Details**: See `PROJECT_SUMMARY.md`
- **Backend API**: See `backend/API_SUMMARY.md`
- **Frontend**: See `frontend/README.md`

---

## 🔧 Troubleshooting

**Port already in use?**
```bash
# Change backend port in backend/.env
PORT=5002

# Change frontend port
cd frontend
npm run dev -- --port 3001
```

**MongoDB connection error?**
- Check internet connection
- Verify credentials in `backend/.env`

**Camera not working?**
- Allow camera permissions
- Use HTTPS in production
- Try different browser

---

## ⚡ Production Deployment

### Backend
```bash
cd backend
npm run build  # If applicable
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

Or deploy to:
- **Frontend**: Vercel, Netlify
- **Backend**: Heroku, Railway, Render

---

**Status**: ✅ Ready to Run!

**Servers**:
- Backend: http://localhost:5001
- Frontend: http://localhost:3000

🎉 **Enjoy your Bus Ticketing System!**
