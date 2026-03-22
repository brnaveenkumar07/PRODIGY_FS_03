import { NextRequest, NextResponse } from "next/server";

// This proxy can be used for authentication/authorization.
// It currently allows all requests while keeping the app aligned with Next 16.
export function proxy(request: NextRequest) {
  void request;

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
