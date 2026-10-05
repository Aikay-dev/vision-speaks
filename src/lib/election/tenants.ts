import "server-only";

/**
 * Hardcoded tenant (client) accounts for the election monitoring portal.
 *
 * To add a tenant: add an entry here, put its logo in public/election/tenants/,
 * hash a password with `node scripts/hash-password.mjs <password>`, redeploy.
 *
 * Tenant ids are stored on every database record — never change an id once
 * the tenant has data.
 */

export type TenantLogin = { username: string; passwordHash: string };

export type Tenant = {
  id: string;
  name: string;
  shortName: string;
  headerTitle: string;
  /** Accent for buttons, active nav, focus rings. */
  brandColor: string;
  /** Flag stripe shown under the header, left to right. */
  stripe: string[];
  logo: string;
  logins: TenantLogin[];
};

export const TENANTS: Tenant[] = [
  {
    id: "lp",
    name: "Labour Party",
    shortName: "LP",
    headerTitle: "LABOUR PARTY ELECTION MONITORING SYSTEM",
    brandColor: "#0A7D3B",
    stripe: ["#D2161E", "#0A7D3B"],
    logo: "/election/tenants/lp.jpg",
    logins: [
      {
        username: "lp-admin",
        passwordHash:
          "$2b$12$4HDZB7YIXiAZchVnI0xfZOgu/9lb1qiOZMYz.QwgbmpoC1I4K2Mre",
      },
    ],
  },
  {
    id: "ndc",
    name: "Nigeria Democratic Congress",
    shortName: "NDC",
    headerTitle: "NIGERIA DEMOCRATIC CONGRESS ELECTION MONITORING SYSTEM",
    brandColor: "#2563B8",
    stripe: ["#3FA142", "#D8323A", "#3D7DD8"],
    logo: "/election/tenants/ndc.jpeg",
    logins: [
      {
        username: "ndc-admin",
        passwordHash:
          "$2b$12$JZX1id5EX4pLxcysn9veFeZJn4lsSCs5IclrocPGkT..qU/b.yfOe",
      },
    ],
  },
];

export function getTenant(id: string): Tenant | undefined {
  return TENANTS.find((t) => t.id === id);
}

export function findTenantLogin(username: string) {
  const u = username.trim().toLowerCase();
  for (const tenant of TENANTS) {
    const login = tenant.logins.find((l) => l.username.toLowerCase() === u);
    if (login) return { tenant, login };
  }
  return null;
}

export function isReservedUsername(username: string) {
  return findTenantLogin(username) !== null;
}

/** The subset of tenant data that is safe to send to the browser. */
export type PublicTenant = Omit<Tenant, "logins">;

export function toPublicTenant(t: Tenant): PublicTenant {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { logins, ...rest } = t;
  return rest;
}
