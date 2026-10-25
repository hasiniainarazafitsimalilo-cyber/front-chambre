import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/account"];
const AUTH_PAGES = ["/connexion", "/inscription"];

function decodeRole(jwt: string): string | null {
  try {
    const part = jwt.split(".")[1];
    if (!part) return null;
    const json = Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
    return JSON.parse(json)?.role ?? null;
  } catch {
    return null;
  }
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // Cookie stores the JWT access token (value used only for routing — security stays on backend).
  const sessionCookie = request.cookies.get("hotelia_session");
  const token = sessionCookie?.value ?? null;
  const hasSession = Boolean(token);

  // Not logged in → redirect to connexion for protected pages
  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Decode role from JWT payload for smart routing
  if (hasSession && token) {
    const role = decodeRole(token);

    // CLIENT cannot access /dashboard → send to /account
    if (pathname.startsWith("/dashboard") && role === "CLIENT") {
      const url = request.nextUrl.clone();
      url.pathname = "/account";
      return NextResponse.redirect(url);
    }

    // ADMIN / RECEPTIONIST trying to access /account → send to /dashboard
    if (pathname.startsWith("/account") && role !== null && role !== "CLIENT") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Already logged in, trying to access login/register → redirect to correct home
    if (isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = role === "CLIENT" ? "/account" : "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
