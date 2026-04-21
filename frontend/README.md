# BusQR Frontend

Mobile-first Next.js application for BusQR smart QR bus ticketing with Clerk authentication.

## ✨ Features

- 🔐 **Authentication** - Clerk-powered sign in/up
- 🎫 **Generate QR Tickets** - Create and view digital tickets
- 📷 **Scan & Validate** - Conductor scanner with valid/used/invalid states
- 💰 **Wallet Management** - Recharge and view transaction history
- 👤 **User Registration** - Profile setup + wallet initialization
- 🎨 **Premium Mobile UI** - Clean grayscale + orange accent
- 📱 **Mobile First** - iPhone-like layout and bottom tabs

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
│   ├── layout.tsx                # Root layout + Clerk + toasts
│   ├── page.tsx                  # Home
│   ├── register/page.tsx         # Registration
│   ├── wallet/page.tsx           # Wallet
│   ├── generate/page.tsx         # Generate ticket
│   ├── tickets/page.tsx          # Ticket history
│   ├── tickets/[ticketId]/page.tsx # QR ticket details
│   ├── scanner/page.tsx          # Camera scanner
│   └── globals.css               # Global styling
├── components/
│   ├── Navbar.tsx
│   ├── BottomTabBar.tsx
│   ├── WalletCard.tsx
│   ├── TicketCard.tsx
│   ├── QRCard.tsx
│   ├── ScannerCard.tsx
│   └── ActionButton.tsx
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

- `POST /auth/sync` - Register/sync user
- `POST /wallet/add` - Recharge wallet
- `POST /tickets/book` - Generate ticket(s)
- `GET /tickets/my` - Wallet balance + ticket history
- `POST /tickets/scan` - Validate scanned ticket (admin only)

See [backend/API_SUMMARY.md](../backend/API_SUMMARY.md) for complete API reference.

## 👥 User Flow

1. **Sign Up** (Clerk) → Authenticate with email/social
2. **Register** (Local) → Create bus system user account
3. **Recharge** → Add balance to wallet
4. **Generate Ticket** → Create QR code (₹20 deducted)
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
