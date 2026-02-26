import { NextRequest, NextResponse } from "next/server";

// This middleware can be used for authentication/authorization
// Currently set to allow all requests for development

export function middleware(request: NextRequest) {
  // TODO: Implement authentication checks
  // Examples:
  // 1. Verify JWT tokens
  // 2. Check user session
  // 3. Verify admin role for /admin routes
  // 4. Redirect unauthenticated users to login

  // Current setup: Allow all requests
  return NextResponse.next();
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    // Run on all routes except:
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

// Example implementation (commented out for development):
/*
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Routes that require authentication
  const protectedRoutes = ["/admin", "/orders", "/cart"];
  
  // Check if route is protected
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get("auth-token");
    
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    // Verify token and check role if admin
    if (pathname.startsWith("/admin")) {
      const isAdmin = await verifyAdminToken(token.value);
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return NextResponse.next();
}
*/
