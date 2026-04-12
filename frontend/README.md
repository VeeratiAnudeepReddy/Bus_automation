# BusQR Frontend

Modern Next.js application for QR Code-based Bus Ticketing System with Clerk authentication.

## ✨ Features

- 🔐 **Authentication** - Clerk-powered sign in/up
- 🎫 **Generate QR Tickets** - Create unique QR codes
- 📷 **Scan & Validate** - Camera-based ticket validation
- 💰 **Wallet Management** - Recharge and track balance
- 👤 **User Registration** - Local user system
- 🎨 **Premium Design** - Glassmorphism UI
- 📱 **Fully Responsive** - Works on all devices

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Authentication**: Clerk
- **Styling**: Tailwind CSS 4
- **QR Code**: qrcode.react, html5-qrcode
- **HTTP Client**: Axios
- **Font**: Inter (Google Fonts)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on http://localhost:5001
- Clerk account (free tier available)

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env.local` file:

```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5001/api

# Clerk Authentication (get from https://dashboard.clerk.com/)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
```

**📖 See [CLERK_SETUP.md](./CLERK_SETUP.md) for detailed Clerk configuration.**

### Development

```bash
npm run dev
```

Visit http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with Navbar + ClerkProvider
│   ├── page.tsx            # Home (ticket generation)
│   ├── scanner/page.tsx    # QR scanner
│   ├── register/page.tsx   # User registration
│   ├── recharge/page.tsx   # Wallet recharge
│   └── globals.css         # Tailwind + custom styles
├── components/
│   ├── Navbar.tsx          # Navigation with Clerk auth UI
│   ├── Card.tsx            # Glass card component
│   ├── Button.tsx          # Primary button
│   └── Input.tsx           # Styled input field
├── lib/
│   └── api.ts              # API service layer
├── proxy.ts                # Clerk middleware
├── .env.local              # Environment variables (not in Git)
└── .env.example            # Template for environment variables
```

## 🎨 Design System

### Colors

- **Primary**: Orange (#ff7a00)
- **Secondary**: Gray (#6b7280)
- **Background**: Gradient (white → light gray)

### Components

All components follow the glassmorphism design pattern with:
- Backdrop blur effects
- Subtle shadows (shadow-lg, shadow-xl)
- Smooth transitions and animations
- Rounded corners (rounded-xl, rounded-2xl)

### Typography

- **Font**: Inter (via Google Fonts)
- **Sizes**: Responsive scale from mobile to desktop

## 🔌 API Integration

The app connects to the backend API with these endpoints:

- `POST /register` - Create new user
- `POST /recharge` - Add balance to wallet
- `POST /generate-ticket` - Generate QR ticket
- `POST /validate` - Validate scanned ticket
- `GET /user/:id` - Get user details

See [backend/API_SUMMARY.md](../backend/API_SUMMARY.md) for complete API reference.

## 👥 User Flow

1. **Sign Up** (Clerk) → Authenticate with email/social
2. **Register** (Local) → Create bus system user account
3. **Recharge** → Add balance to wallet
4. **Generate Ticket** → Create QR code (₹10 deducted)
5. **Scan** → Validate ticket at bus entrance

## 🔐 Authentication

This app uses **Clerk** for modern authentication:

- **Sign In/Up Modals** - Smooth modal experience
- **User Profile** - Built-in user management
- **Session Management** - Automatic token refresh
- **Social Providers** - Google, GitHub, etc. (optional)

The local registration system (Register page) is for creating bus system user accounts linked to your Clerk user.

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## 📚 Documentation

- [Clerk Setup Guide](./CLERK_SETUP.md) - Step-by-step Clerk configuration
- [Backend API](../backend/API_SUMMARY.md) - Complete API reference
- [Project Overview](../PROJECT_SUMMARY.md) - Full project documentation

## 🔧 Troubleshooting

### Build fails with Clerk errors

Make sure environment variables are set in `.env.local` and restart the dev server.

### "Missing publishableKey" error

Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` to `.env.local` and restart.

### Camera not working for QR scanner

Ensure you've granted camera permissions in your browser.

### API connection refused

Make sure the backend is running on http://localhost:5001

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 📄 License

MIT
