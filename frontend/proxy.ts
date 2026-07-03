import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtected = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/wallet(.*)',
  '/generate(.*)',
  '/tickets(.*)',
  '/scanner(.*)',
  '/organization(.*)',
  '/organizations(.*)',
  '/operations(.*)',
  '/fleet(.*)',
  '/dispatcher(.*)',
  '/trips(.*)',
  '/my-trips(.*)',
  '/trip-status(.*)',
  '/track(.*)',
  '/boarding(.*)',
  '/calendar(.*)',
  '/maintenance(.*)',
  '/fuel(.*)',
  '/leave(.*)',
  '/incidents(.*)',
  '/buses(.*)',
  '/drivers(.*)',
  '/conductors(.*)',
  '/schedules(.*)',
  '/booking(.*)',
  '/bookings(.*)',
  '/refunds(.*)',
  '/finance(.*)',
  '/payments(.*)',
  '/customer(.*)',
  '/conductor(.*)',
  '/driver(.*)',
  '/audit(.*)',
  '/reports(.*)',
  '/notifications(.*)',
  '/pricing(.*)',
  '/super-admin(.*)',
  '/support(.*)',
  '/complete-profile(.*)',
  '/search(.*)',
  '/profile(.*)',
  '/settings(.*)',
  '/onboarding(.*)',
  '/posts(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
