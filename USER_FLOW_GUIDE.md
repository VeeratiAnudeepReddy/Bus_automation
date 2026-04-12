# 🎯 Complete User Flow Guide - Admin & User System

## 🔄 Complete Flow Overview

Your BusQR system now has **two types of accounts**:

1. **Regular Users** - Can generate and use tickets
2. **Admins** - Can scan and validate tickets

---

## 👥 **For Regular Users (Passengers)**

### Step 1: Sign Up with Clerk
1. Go to http://localhost:3000
2. Click **"Sign Up"** (orange button)
3. Enter email and create password
4. ✓ You're now authenticated with Clerk

### Step 2: Register as User
1. Click **"Register"** in navbar
2. Fill in your details:
   - Full Name
   - Email (auto-filled from Clerk)
   - Phone Number
3. Click **"Register"**
4. ✓ Get your User ID (auto-saved)

### Step 3: Recharge Wallet
1. Click **"Recharge"** in navbar
2. Your User ID is auto-filled
3. Enter amount (or click quick amount buttons)
4. Click **"Recharge Wallet"**
5. ✓ Balance updated (e.g., +₹100)

### Step 4: Generate QR Ticket
1. Click **"Ticket"** in navbar (or go to home)
2. Your User ID is auto-filled
3. Click **"Generate Ticket"**
4. ✓ QR code appears (₹10 deducted from balance)
5. Save/screenshot the QR code

### Step 5: Use Ticket
1. Show QR code at bus entrance
2. Admin scans your ticket
3. ✓ Entry allowed if valid

---

## 👨‍💼 **For Admins (Bus Staff)**

### Step 1: Sign Up with Clerk
1. Go to http://localhost:3000
2. Click **"Sign Up"** (orange button)
3. Enter email and create password
4. ✓ You're now authenticated with Clerk

### Step 2: Register as Admin
1. Go to http://localhost:3000/admin
2. Fill in your details:
   - Full Name
   - Email (auto-filled from Clerk)
   - Phone Number
3. Click **"Register as Admin"**
4. ✓ Get your Admin ID (you won't need this, but it's saved)

### Step 3: Access Scanner
1. Click **"Scanner"** in navbar
2. Click **"Start Scanner"**
3. Allow camera permissions
4. Point camera at passenger's QR code
5. ✓ See validation result:
   - **GREEN** = VALID → Allow entry
   - **ORANGE** = ALREADY_USED → Ticket used
   - **RED** = INVALID → Deny entry

---

## 🔐 Role-Based Access

### Regular User Dashboard
**Navbar shows:**
- Register
- Recharge
- Ticket
- Admin (if not registered yet)

**Can access:**
- ✓ /register - User registration
- ✓ /recharge - Wallet recharge
- ✓ / (home) - Ticket generation
- ✗ /scanner - Access denied (admin only)

### Admin Dashboard
**Navbar shows:**
- Scanner

**Can access:**
- ✓ /scanner - QR code validation
- ✓ /admin - Admin registration (if needed)

---

## 🎬 Quick Test Scenarios

### Scenario 1: Complete User Journey
```
1. Sign Up with Clerk → john@example.com
2. Register as User → Get ID: abc123...
3. Recharge ₹100 → Balance: ₹100
4. Generate Ticket → Balance: ₹90
5. Admin scans → Status: VALID ✓
6. Try to use same ticket → Status: ALREADY_USED ⚠️
```

### Scenario 2: Admin Setup
```
1. Sign Up with Clerk → admin@buscompany.com
2. Go to /admin → Register as Admin
3. Go to /scanner → Access granted
4. Scan QR codes → Validate tickets
```

### Scenario 3: Access Control
```
Regular User tries to access /scanner:
→ "Access Denied - Only admins can access the scanner"
→ Button: "Register as Admin"
```

---

## 🔑 Important URLs

- **Home**: http://localhost:3000
- **User Registration**: http://localhost:3000/register
- **Admin Registration**: http://localhost:3000/admin
- **Wallet Recharge**: http://localhost:3000/recharge
- **Scanner (Admin Only)**: http://localhost:3000/scanner

---

## 💾 Data Persistence

### Stored in Browser (localStorage)
- `currentUserId` - Your User/Admin ID
- `userRole` - "user" or "admin"

### Stored in Database (MongoDB)
- User account details
- Wallet balance
- Tickets generated
- Ticket validation status

---

## 🎨 Visual Differences

### User Account (Orange Theme)
- Register button → Orange
- Recharge focus → Wallet management
- Primary action → Generate tickets

### Admin Account (Multi-color Theme)
- Scanner button highlighted
- Red/Green validation feedback
- Admin badge → 👨‍💼 Admin Access

---

## 📋 Testing Checklist

### User Flow ✓
- [ ] Sign up with Clerk
- [ ] Register as regular user
- [ ] Recharge wallet
- [ ] Generate QR ticket
- [ ] User ID auto-saves
- [ ] Balance updates correctly
- [ ] Can generate multiple tickets

### Admin Flow ✓
- [ ] Sign up with Clerk (different email)
- [ ] Register as admin
- [ ] Access scanner page
- [ ] Start camera
- [ ] Scan valid ticket → GREEN
- [ ] Scan used ticket → ORANGE
- [ ] Scan invalid code → RED

### Access Control ✓
- [ ] Regular user can't access /scanner
- [ ] Admin can access /scanner
- [ ] Proper error messages
- [ ] Redirect to registration if needed

---

## 🔧 Troubleshooting

### "Access Denied" on Scanner
**Problem**: Regular user trying to access scanner
**Solution**: Register as admin at /admin

### User ID not auto-filling
**Problem**: localStorage not set
**Solution**: Register again or check browser console

### Scanner not starting
**Problem**: Camera permissions denied
**Solution**: Allow camera access in browser settings

### Role not updating
**Problem**: localStorage has old role
**Solution**: Clear localStorage or re-register

---

## 🎯 Quick Commands

### Check Your Role
```javascript
// In browser console (F12)
localStorage.getItem('userRole')
// Returns: "user" or "admin"
```

### Switch Accounts
```javascript
// Clear current session
localStorage.removeItem('currentUserId')
localStorage.removeItem('userRole')
// Then register as different role
```

### Get All Users (Backend)
```bash
curl http://localhost:5001/api/users
```

---

## 📊 System Architecture

```
┌─────────────────────────────────────────┐
│           Clerk Authentication          │
│         (Email/Password Login)          │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    ┌───▼────┐           ┌───▼────┐
    │  USER  │           │ ADMIN  │
    │  Role  │           │  Role  │
    └───┬────┘           └───┬────┘
        │                     │
    ┌───▼────────────┐   ┌───▼────────┐
    │ • Register     │   │ • Scanner  │
    │ • Recharge     │   │ • Validate │
    │ • Generate QR  │   │ • Reports  │
    └────────────────┘   └────────────┘
```

---

## ✨ Features Summary

### Authentication
- ✓ Clerk-powered sign in/up
- ✓ Role-based access control
- ✓ Secure session management

### User Features
- ✓ Wallet system
- ✓ QR ticket generation
- ✓ Balance tracking
- ✓ Transaction history

### Admin Features
- ✓ QR code scanning
- ✓ Real-time validation
- ✓ Visual feedback (Green/Orange/Red)
- ✓ Camera integration

---

**Ready to test?** Start with the user flow, then test admin scanning! 🚀
