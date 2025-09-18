// import { getToken } from "next-auth/jwt";
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export async function middleware(req: NextRequest) {
//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//   const url = req.nextUrl.clone();

//   // যদি token না থাকে, redirect to login
//   if (!token) {
//     url.pathname = "/login";
//     return NextResponse.redirect(url);
//   }

//   // যদি user role Admin না হয়, redirect to home
//   if (token.role !== "admin") {
//     url.pathname = "/";
//     return NextResponse.redirect(url);
//   }

//   return NextResponse.next();
// }

// // middleware কে যেসব route এ apply হবে
// export const config = {
//   matcher: ["/dashboard/:path*"], // dashboard এর সব routes protect
// };
