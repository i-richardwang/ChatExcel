import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define protected routes - add routes that need authentication here
const isProtectedRoute = createRouteMatcher([
  '/api(.*)', // Protect all API routes
  '/account(.*)', // Example: protect account pages
  '/settings(.*)', // Example: protect settings pages
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
