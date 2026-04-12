# 🔐 Clerk Authentication Setup Guide

This guide will help you set up Clerk authentication for the BusQR application.

---

## 📋 Prerequisites

- A Clerk account (free tier available)
- Access to [Clerk Dashboard](https://dashboard.clerk.com/)

---

## 🚀 Quick Setup

### 1. Create a Clerk Application

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com/)
2. Click **"+ Create application"**
3. Name it: **BusQR** (or any name you prefer)
4. Choose your authentication methods:
   - ✅ Email
   - ✅ Google (optional)
   - ✅ GitHub (optional)
5. Click **Create application**

---

### 2. Get Your API Keys

After creating the application, you'll see your API keys:

1. In the Clerk dashboard, go to **API Keys** (left sidebar)
2. Copy the **Publishable Key** (starts with `pk_test_...`)
3. Copy the **Secret Key** (starts with `sk_test_...`)

---

### 3. Configure Environment Variables

Update your `.env.local` file:

```bash
# Replace with your actual keys from Clerk Dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YourPublishableKeyHere
CLERK_SECRET_KEY=sk_test_YourSecretKeyHere
```

**Important:**
- Keep the `CLERK_SECRET_KEY` secret - never commit it to Git
- The `NEXT_PUBLIC_` prefix makes the publishable key available to the browser

---

### 4. Restart the Development Server

```bash
npm run dev
```

---

## ✅ Verify Setup

### Test Authentication Flow:

1. **Visit** http://localhost:3000
2. **Click** "Sign Up" in the navbar
3. **Complete** the registration form
4. **See** your profile icon (UserButton) appear in the navbar
5. **Success!** 🎉

---

## 🎨 What's Included

### Components Added:

- **Sign In Button** - Opens sign-in modal
- **Sign Up Button** - Opens sign-up modal  
- **User Button** - Shows user profile with dropdown menu
- **Show Component** - Conditionally renders based on auth state

### Files Modified:

- `app/layout.tsx` - Wrapped in `<ClerkProvider>`
- `components/Navbar.tsx` - Added Clerk auth UI
- `proxy.ts` - Clerk middleware for route protection

---

## 🛡️ Protected Routes (Optional)

To protect specific routes, update `proxy.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/recharge(.*)',
  '/scanner(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

This will require authentication to access `/recharge` and `/scanner` pages.

---

## 🎯 Next Steps

1. **Customize branding** - Add your logo in Clerk Dashboard
2. **Add social providers** - Enable Google, GitHub, etc.
3. **Set up webhooks** - Sync user data with your backend
4. **Add organizations** - Enable team/group features

---

## 📚 Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Integration](https://clerk.com/docs/nextjs)
- [Component Reference](https://clerk.com/docs/reference/components/overview)
- [Dashboard](https://dashboard.clerk.com/)

---

## 🔧 Troubleshooting

### "Missing publishableKey" error

- Make sure `.env.local` has `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Restart the dev server after adding environment variables

### Sign in modal not appearing

- Check browser console for errors
- Verify API keys are correct
- Clear browser cache and cookies

### Build errors

- Ensure all imports are from `@clerk/nextjs` (not old packages)
- Check that `proxy.ts` exists in the root of the frontend folder

---

## 💡 Pro Tips

- Use Clerk's built-in user management dashboard
- Enable multi-factor authentication for added security
- Customize the appearance using Clerk's theming system
- Monitor authentication metrics in the Clerk Dashboard

---

**Need help?** Visit [Clerk's support](https://clerk.com/support) or check the [community forum](https://clerk.com/discord).
