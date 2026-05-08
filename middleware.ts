import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  // Expose the pathname as a response header so layout.tsx (server component) can read it
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
}

export const config = {
  // Run on all routes except Next.js internals and static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
