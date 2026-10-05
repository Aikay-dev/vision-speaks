import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/election/session-core";

/**
 * First gate for the election portal. Pages and server actions re-check the
 * session themselves; this just keeps signed-out users off protected routes.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  const needs = pathname.startsWith("/election/admin") || pathname.startsWith("/election/tv") ? "admin" : "agent";

  if (!session || session.role !== needs) {
    const url = request.nextUrl.clone();
    url.pathname = "/election";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/election/admin/:path*", "/election/tv/:path*", "/election/agent/:path*"],
};
