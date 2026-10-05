"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/election/db";
import { Agent, Election } from "@/lib/election/models";
import { clearSession, setSession } from "@/lib/election/session";
import { findTenantLogin, getTenant } from "@/lib/election/tenants";

export type LoginState = { error?: string };

// Simple in-memory throttle: 8 failures per username+IP per 15 minutes.
// Per-instance only, which is enough to slow down guessing on a small portal.
const failures = new Map<string, { count: number; until: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;

// Compare against a dummy hash when the user doesn't exist, so response time
// doesn't reveal which usernames are real.
const DUMMY_HASH = "$2b$12$UpZnXPkSskuJFwnoegEgZukSVqcU3DdqMm/3rIlXgGH6ZCMpneWoK";

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) return { error: "Enter your username and password." };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = `${username}|${ip}`;
  const f = failures.get(key);
  if (f && f.count >= MAX_FAILURES && f.until > Date.now()) {
    return { error: "Too many failed attempts. Try again in 15 minutes." };
  }
  const fail = (): LoginState => {
    const cur = failures.get(key);
    const fresh = !cur || cur.until < Date.now();
    failures.set(key, { count: fresh ? 1 : cur.count + 1, until: Date.now() + WINDOW_MS });
    return { error: "Incorrect username or password." };
  };

  // 1. Hardcoded tenant admins.
  const admin = findTenantLogin(username);
  if (admin) {
    if (!(await bcrypt.compare(password, admin.login.passwordHash))) return fail();
    failures.delete(key);
    await setSession({ role: "admin", tenantId: admin.tenant.id, sub: admin.login.username, name: admin.tenant.shortName });
    redirect("/election/admin");
  }

  // 2. Field agents. DB failures become a message, not a 500. redirect() stays
  // outside the try because it works by throwing.
  let agent;
  try {
    await connectDB();
    agent = await Agent.findOne({ username }).lean();
    const ok = await bcrypt.compare(password, agent?.passwordHash ?? DUMMY_HASH);
    if (!agent || !ok) return fail();
    if (!agent.active) return { error: "This account has been deactivated. Contact your coordinator." };
    if (!getTenant(agent.tenantId)) return fail();
    const election = await Election.findOne({ _id: agent.electionId, tenantId: agent.tenantId }, { _id: 1 }).lean();
    if (!election) return { error: "This account is no longer linked to an election." };
    await Agent.updateOne({ _id: agent._id }, { $set: { lastLoginAt: new Date() } });
  } catch (e) {
    console.error("[election] login: database unavailable", e);
    return { error: "Can't reach the server right now. Check your connection and try again in a moment." };
  }

  failures.delete(key);
  await setSession({
    role: "agent",
    tenantId: agent.tenantId,
    sub: String(agent._id),
    name: agent.name,
    electionId: String(agent.electionId),
  });
  redirect("/election/agent");
}

export async function logout() {
  await clearSession();
  redirect("/election");
}
