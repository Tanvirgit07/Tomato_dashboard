import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const path = request.nextUrl.pathname;

  // 🔓 public routes
  const publicPaths = ["/login", "/signin", "/api/auth"];

  // ❌ login নাই → /login
  if (!token && !publicPaths.some((p) => path.startsWith(p))) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // ❌ admin ছাড়া কেউ না
  if (token && token.role !== "admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
