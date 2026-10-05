import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_TTL,
  signSession,
  verifySession,
  type Session,
} from "./session-core";
import { getTenant } from "./tenants";

export type { Session };

export async function getSession() {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export async function setSession(session: Session) {
  const store = await cookies();
  store.set(SESSION_COOKIE, await signSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL[session.role],
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** For pages: redirects to the login page when there is no admin session. */
export async function requireAdmin() {
  const session = await getSession();
  const tenant = session && getTenant(session.tenantId);
  if (!session || session.role !== "admin" || !tenant) redirect("/election");
  return { session, tenant };
}

export async function requireAgent() {
  const session = await getSession();
  const tenant = session && getTenant(session.tenantId);
  if (!session || session.role !== "agent" || !tenant || !session.electionId) {
    redirect("/election");
  }
  return { session: session as Session & { electionId: string }, tenant };
}

/** For server actions / route handlers: throws instead of redirecting. */
export async function assertAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin" || !getTenant(session.tenantId)) {
    throw new Error("Not authorised");
  }
  return session;
}

export async function assertAgent() {
  const session = await getSession();
  if (!session || session.role !== "agent" || !session.electionId) {
    throw new Error("Not authorised");
  }
  return session as Session & { electionId: string };
}
