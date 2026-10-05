# Election Monitoring System — Build Plan

Status: **built, not yet deployed** (2026-10-05). All phases in §11 are implemented and were tested end to end against a local MongoDB. Waiting on: MongoDB Atlas URI and EdgeStore keys before deploying (see §0).

## 0. Deployment checklist

1. **Vercel → Project → Settings → Environment Variables** (Production + Preview):
   - `MONGODB_URI`: Atlas connection string. Atlas → Network Access must allow `0.0.0.0/0` (Vercel IPs are dynamic). Use a DB user that can only reach this database.
   - `MONGODB_DB` (optional): database name, default `election_monitoring`.
   - `ELECTION_SESSION_SECRET`: 32+ random characters (`node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`). Changing it signs everyone out.
   - `EDGESTORE_ACCESS_KEY` and `EDGESTORE_SECRET_KEY` (note: no underscore in EDGESTORE). Until these are set, agents can't upload photos. Everything else works.
2. Deploy. The marketing pages are unaffected (still static).
3. Sign in at `/election` with the tenant admin logins (passwords were handed over separately; they are only stored as bcrypt hashes in `src/lib/election/tenants.ts`).
4. Optional demo: `MONGODB_URI=... node scripts/seed-demo.mjs --tenant lp` creates a clearly-labelled DEMO election with 120 PUs and fake results (agent password `demo-pass`). Delete it afterwards from Setup → Details. **Don't leave demo agents in production.**

To change a tenant password: `node scripts/hash-password.mjs <new password>`, paste the hash into `tenants.ts`, redeploy.

### Built vs plan, deviations
- Tenant **NDC = Nigeria Democratic Congress** (confirmed from INEC's party list). Note: a Federal High Court (Lokoja) ordered its deregistration over a logo dispute on 26 Jun 2026, but INEC still lists it as registered. Worth mentioning to the client.
- Party logos for all 21 INEC parties are in `public/election/parties/`, downloaded from inecnigeria.org. Accord had no logo on INEC's site, so it shows a coloured code badge.
- Login page uses a neutral typographic panel, not the site's election photos: those show PDP campaign branding, which shouldn't appear on an LP/NDC portal.
- Agent submit is one route (`/election/agent/submit`), since each agent has exactly one PU.
- Party colours fail colour-blind separation for red/green pairs (PDP vs LP), as real party colours will. Mitigated: every chart mark carries the party code and logo as a direct label.

This adds a multi-tenant election monitoring and result-collation portal to the Visionspeaks site. The reference is the `election.bighms.com.ng` PHP system in the client's video. We keep its core flow and fix its gaps.

---

## 1. What the reference system does, and where we do better

| Reference (video) | Our version |
|---|---|
| One admin, one party dataset | Multiple **hardcoded tenant accounts** (e.g. Labour Party), fully isolated data |
| Generic "Election MSys." header | Per-tenant branded header: **LABOUR PARTY ELECTION MONITORING SYSTEM**, with tenant colour and logo |
| Two login pages (admin `/`, inspector `/inspector`) | One login page. The system detects whether the user is an admin or an agent |
| Agent types a number into each party, then clicks "Update" per party | One form for the whole result sheet: photo, all party scores, voter figures, a review screen, then a single submit |
| No photo evidence | Required photo of the result sheet (EC8A), compressed on the phone, stored in EdgeStore |
| No validation | Automatic checks (votes vs accredited voters, etc.). Suspect sheets get flagged for review |
| Admin sees totals only | Admin sees the photo beside the typed numbers, can correct them (with a reason), and marks each sheet verified or flagged. All changes go into an audit trail |
| Green tiles, one bar chart | Live dashboard: reporting progress, party share, lead margin, turnout, results by LGA, and a feed of recent submissions. Refreshes every 10s |
| Passwords shown in plain text in the accounts table (`1*1`) | bcrypt hashes. Passwords are shown once, at creation or reset |
| Not HTTPS, times out | Vercel + Atlas, HTTPS, pages built for poor networks |

---

## 2. Roles and access model

```
Hardcoded tenant admin (NDC, LP)             ← lives in code, not DB
  └── creates 1..n Election Monitorings      ← DB, tenantId-scoped (admin names each one)
        ├── Parties / candidates
        ├── Locations: State → LGA → Ward → Polling Unit (admin creates wards + PUs,
        │                                                 sets registered voters per PU)
        ├── Field agents (created by the admin) → exactly ONE polling unit each
        └── Result submissions (from agents, corrected by the admin)
```

- **One agent per polling unit** (confirmed). Enforced by a unique index on `agents.pollingUnitId`. The Add-agent form only lists PUs that don't have an agent yet. Agents are picked through LGA → Ward → PU, so the admin can work ward by ward.
- An agent belongs to exactly one election monitoring, because their PU does. The same person working a later election gets a new account for that election.

- **Tenant admin**: hardcoded username + bcrypt hash + branding config. Can have more than one login per tenant (e.g. `labour` and `labour-ops`), all with the same `tenantId`.
- **Field agent**: a MongoDB document created by a tenant admin. Can only see and submit for their assigned polling unit(s).
- **Isolation rule**: `tenantId` always comes from the signed session cookie, never from the request body or URL. Every DB query goes through a helper that adds `{ tenantId }` automatically, so a missing filter can't leak another tenant's data.
- **Agent usernames** must be unique across the whole system, because there is one login page. When the admin creates an agent, the username is pre-filled with the tenant prefix (`lp-ikeja-014`). The admin can edit it, but uniqueness is enforced by an index.

---

## 3. Tech additions

| Need | Choice | Why |
|---|---|---|
| Database | MongoDB Atlas + **mongoose** | Requested; schemas and indexes in code; cached connection for serverless |
| Sessions | **jose** (signed JWT in an httpOnly cookie) | No auth provider needed with hardcoded tenants; works in `proxy.ts` |
| Password hashing | **bcryptjs** | Pure JS, no native build on Vercel |
| Validation | **zod** | Shared between client forms and server actions |
| Image upload | **@edgestore/server + @edgestore/react** | Requested |
| Image compression | **browser-image-compression** | Shrinks a 4 MB phone photo to ~300 KB before upload. Important on polling-unit networks |
| Polling / data fetching | **swr** (`refreshInterval: 10000`) | "Fetch new data every few seconds" without websockets |
| Charts | **recharts** | Mature and SSR-safe, fine with React 19 |
| CSV import (locations, agents) | **papaparse** | Admins won't type 1,500 polling units one by one |

Env vars (all server-only except where noted):
```
MONGODB_URI=
ELECTION_SESSION_SECRET=        # 32+ random bytes
EDGESTORE_ACCESS_KEY=
EDGESTORE_SECRET_KEY=
```
Atlas → Network Access must allow `0.0.0.0/0` because Vercel IPs are dynamic. Use a DB user limited to this one database.

---

## 4. Data model (MongoDB collections)

All documents carry `tenantId` (string, from the hardcoded config) and, where relevant, `electionId`.

**Hardcoded — `src/lib/election/tenants.ts`** (server-only). Two tenants at launch:
```ts
{ id: "lp",  name: "Labour Party", shortName: "LP",
  headerTitle: "LABOUR PARTY ELECTION MONITORING SYSTEM",
  brandColor: "<from LP logo>", logo: "/election/tenants/lp.png",
  logins: [{ username: "lp-admin", passwordHash: "$2a$12$..." }] },
{ id: "ndc", name: "National Democratic Congress", shortName: "NDC",   // ← confirm full name
  headerTitle: "NATIONAL DEMOCRATIC CONGRESS ELECTION MONITORING SYSTEM",
  brandColor: "<from NDC logo>", logo: "/election/tenants/ndc.png",
  logins: [{ username: "ndc-admin", passwordHash: "$2a$12$..." }] }
```
Adding a third party later means adding one object here and redeploying.

**elections** (shown in the UI as "Election Monitorings"): `{ tenantId, name (admin's own label, e.g. "Anambra Governorship 2026"), type: "presidential"|"governorship"|"senate"|"reps"|"house_of_assembly"|"lga_chairman"|"councillor"|"other", date, description?, status: "setup"|"live"|"closed", createdAt }`
- A tenant can have as many as they want. Each one has its own parties, locations, agents and results. Nothing is shared between elections.
- Agents can only submit while the status is `live`. Closing it locks all submissions.

**parties**: `{ tenantId, electionId, code: "LP", name: "Labour Party", candidateName, color, logoUrl?, order }`
- Pre-seed a list of INEC-registered parties with official colours. The admin ticks which ones are on the ballot and adds candidate names.

**locations**: one collection with a `level` field (simpler queries and one CSV importer)
`{ tenantId, electionId, level: "state"|"lga"|"ward"|"pu", name, code?, parentId, path: [stateId, lgaId, wardId], registeredVoters? }`
- The 36 states + FCT and 774 LGAs ship as a static JSON (`src/data/nigeria-states-lgas.json`). The admin chooses from them rather than typing.
- **Wards and polling units are created by the admin** (confirmed), by hand or by CSV (`state,lga,ward,pu_code,pu_name,registered_voters`).
- **Registered voters are entered by the admin** for each PU. Agents don't type this figure; they see it read-only on their form. Ward, LGA and state registered totals are summed from the PUs.
- Index: `{ tenantId, electionId, level, parentId }`.

**agents**: `{ tenantId, electionId, name, phone, username (unique global), passwordHash, pollingUnitId (unique), wardId, lgaId, active, lastLoginAt, createdAt }`

**submissions**: one per polling unit per election
```
{ tenantId, electionId, pollingUnitId, path[], agentId,
  scores: [{ partyId, votes }],
  registeredVoters (copied from the PU at submit time), accreditedVoters, rejectedVotes,
  totalValidVotes (server-computed), totalVotesCast (server-computed),
  images: [{ url, thumbnailUrl, size }],
  comment?,             // optional agent note: "BVAS failed for 2 hours", "thugs disrupted voting"
  geo?: { lat, lng, accuracy },
  status: "submitted"|"flagged"|"verified",
  flags: ["over_accredited", "sum_mismatch", ...],
  clientSubmissionId,   // idempotency key: stops a retry on bad network from double-saving
  history: [{ at, by: {role, id, name}, action, changes: [{field, from, to}], reason }],
  submittedAt, updatedAt }
```
- Unique index `{ tenantId, electionId, pollingUnitId }`. If an agent re-submits before verification, the record is updated in place and logged in `history`. Nothing is double-counted.
- **Edit lock (confirmed):** the agent can edit freely while the status is `submitted` or `flagged`. Once the admin marks it `verified`, the server action refuses agent edits and the agent's screen shows it as read-only. Only the admin can still correct it, and an "un-verify" action exists in case a mistake needs sending back to the agent.
- Index `{ tenantId, electionId, status, updatedAt }` for the feed and the list pages.

**Automatic flags** (don't block the submit; flag for admin review):
- `sum_mismatch`: sum of party votes + rejected ≠ total votes cast, when the agent typed a total
- `over_accredited`: votes cast > accredited voters
- `over_registered`: accredited > registered voters
- `no_image`: shouldn't happen, since an image is required, but kept as a safeguard
- `outlier_turnout`: turnout > 95%
- `late_edit`: changed after the election was closed (admins only)

---

## 5. Route map

Existing marketing pages keep their URLs. They move into a route group so that election pages don't get the marketing Navbar/Footer.

```
src/app/
  layout.tsx                    MODIFY  html/body/font only (remove Navbar/Footer)
  (site)/layout.tsx             NEW     wraps Navbar + <main> + Footer
  (site)/page.tsx               MOVE+MODIFY  add Election Portal section
  (site)/about|contact|downloads|founder|gallery|projects|services|team|testimonials/  MOVE
  robots.ts                     MODIFY  disallow /election
  sitemap.ts                    CHECK   leave /election out

  election/
    layout.tsx                  NEW  election shell (no marketing chrome), noindex metadata
    page.tsx                    NEW  portal: short intro + unified login form
    admin/
      layout.tsx                NEW  branded header, requires admin session
      page.tsx                  NEW  "My Election Monitorings": cards + Create new
      new/page.tsx              NEW  create wizard: name → type/date → state(s) → parties
      [electionId]/
        layout.tsx              NEW  sidebar scoped to this election; checks it belongs to the tenant
        page.tsx                NEW  Live overview dashboard
        results/page.tsx        NEW  drill-down State → LGA → Ward → PU
        submissions/page.tsx    NEW  review queue (filter: all / flagged / unverified / verified / has comment)
        submissions/[id]/page.tsx NEW image viewer + editable figures + comment + history
        agents/page.tsx         NEW  create / assign to PU / reset password / deactivate / CSV import
        setup/page.tsx          NEW  tabs: Details · Parties · Locations (LGAs, wards, PUs, registered voters)
        export/route.ts         NEW  CSV download of results
    agent/
      layout.tsx                NEW  mobile shell, requires agent session
      page.tsx                  NEW  my polling unit + submission status
      submit/[puId]/page.tsx    NEW  3-step result sheet capture
  api/
    edgestore/[...edgestore]/route.ts   NEW
    election/stats/route.ts             NEW  GET, polled by SWR (aggregates)
    election/feed/route.ts              NEW  GET, latest submissions
src/proxy.ts                    NEW  Next 16's replacement for middleware.ts: guards /election/admin/* and /election/agent/*
```

Mutations (login, create agent, submit result, correct, verify) are **server actions** in `src/app/election/**/actions.ts`. Each one re-checks the session. The proxy is only the first gate.

Library code:
```
src/lib/election/
  tenants.ts        hardcoded tenants (server-only)
  session.ts        sign/verify cookie, getSession(), requireAdmin(), requireAgent()
  db.ts             cached mongoose connection
  models/*.ts       Election, Party, Location, Agent, Submission
  scoped.ts         tenant-scoped query helpers
  schemas.ts        zod schemas (shared client/server)
  flags.ts          validation-flag rules
  stats.ts          aggregation pipelines for dashboard
src/lib/edgestore.ts          server router + client provider
src/components/election/      UI components (below)
src/data/nigeria-states-lgas.json
src/data/inec-parties.json
scripts/hash-password.mjs     `node scripts/hash-password.mjs <pw>` → bcrypt hash for tenants.ts
```

---

## 6. EdgeStore setup

- One bucket, `resultSheets` (image bucket, max 8 MB, `image/*`), created with a request context that reads the session cookie.
- `beforeUpload`: reject unless the session is an agent or admin. Path = `{tenantId}/{electionId}/{pollingUnitId}`. Tenants can't write into each other's paths.
- The upload goes into EdgeStore **temporary** storage first, then gets `confirmUpload` in the submit server action. Abandoned uploads get cleaned up automatically, and a photo only persists once its submission saves.
- Admin UI uses EdgeStore's generated thumbnails in lists and the full image in the viewer, with zoom and rotate (phone photos are often sideways).

---

## 7. Auth flow

1. `/election`: one form (username + password).
2. The server action checks hardcoded tenant logins first (bcrypt compare), then `agents` by username (must be `active`).
3. On success, it sets an httpOnly, Secure, SameSite=Lax cookie `vs_election` containing `{ role, tenantId, sub, name, exp }`, signed with `ELECTION_SESSION_SECRET`. Admin sessions last 12h, agent sessions 24h (election day is long).
4. Redirect to `/election/admin` or `/election/agent`.
5. Failed-login throttle: an in-memory counter per username + IP (good enough at this scale). Later, a Mongo `login_attempts` TTL collection.
6. Agent "change password" is optional. Admin "reset password" generates a new one and shows it once, with a "Share via WhatsApp" button (`wa.me/?text=`) holding the login URL + credentials.

---

## 8. Screen-by-screen design

### Design direction
The election module has its **own visual system**. It's still clearly Visionspeaks, but built as a tool, not a marketing page.

- **Tenant brand colour** is the accent, applied as a CSS variable (`--tenant`) on the admin layout. Header, active nav and primary buttons use it. That's what makes it "the Labour Party system".
- **Party colours** are used only for data. A party always has the same colour in every chart, table chip and bar. Tenant colour and party colours never compete: the tenant colour is chrome, party colours are data.
- **Two themes**:
  - *Light* by default for agents. Phones are used in direct sunlight at polling units, so high contrast, big type and 56px touch targets.
  - *Situation Room* (dark) toggle for admins, for projecting on a wall screen on election night. This connects with Visionspeaks' "command centre / situation room" project on the Projects page.
- Inter (already loaded) with `tabular-nums` on every figure so numbers don't jump when they update. Numbers that change get a short highlight (a 600ms tint), so admins can see what just updated.
- Small "Powered by Visionspeaks" footer on every election screen. The client's brand travels with each tenant's portal.

### 8.1 Homepage entry points (marketing site)
- **Navbar**: add an outlined `Election Portal` pill next to "Get a Quote" (desktop), and the same at the bottom of the mobile menu. Low-key, doesn't take over the marketing nav.
- **Home page**: a new section after "Core Solutions": *"Election Monitoring & Live Result Collation"*. Left: 2 lines of copy + 3 proof points (photo-verified results, live collation, data isolated per client). Right: a stylised non-interactive dashboard preview (static mock numbers). CTA: **Access Portal →** `/election`.
- **Services page**: make "Election Monitoring" link to `/election`.
- **Footer**: "Election Portal" under Quick Links.

### 8.2 `/election`: Portal + unified login
- Split screen on desktop: left half has an election photo from `src/assets/2024-election/` (already in the repo) behind a dark gradient, with a line such as "Every polling unit. Every result sheet. Verified." Right half: login card.
- Card: Visionspeaks logo, "Election Monitoring Portal", username, password (show/hide), **Sign in**. Below: "Field agents: use the username and password your coordinator gave you." No role picker; the server works it out.
- Mobile: photo becomes a short header band and the form fills the screen.

### 8.3 Admin: home ("My Election Monitorings") and shell
- **Top bar** in tenant colour: tenant logo + **{HEADER TITLE}** (e.g. LABOUR PARTY ELECTION MONITORING SYSTEM). Right side: theme toggle, account menu.
- **Home**, the first screen after sign-in: a grid of election cards. Each shows name, type, date, status pill (Setup / Live / Closed), PUs reported / total, and agent count. There's a prominent **+ New Election Monitoring** card. First-time empty state: one large "Create your first election monitoring" prompt.
- **Create wizard** (`/new`), 4 short steps: (1) name it, (2) type + date, (3) pick state(s) and then LGAs from the seeded list, (4) tick the parties on the ballot. After that it lands in Setup → Locations to add wards and PUs.
- **Inside an election**: the top bar adds a breadcrumb/switcher (`My Elections › Anambra Governorship 2026 ▾`) and a "Last updated 4s ago" live dot. **Sidebar**: Overview · Results · Submissions (badge = flagged count) · Agents · Setup · Export. On mobile it collapses to a bottom tab bar.
- Status control in the header: **Go Live** / **Close election** buttons, with a confirm step.

### 8.4 Admin: Overview (live, 10s polling)
Top row, 4 stat tiles:
1. **Reporting**: `412 / 1,526 PUs` + progress bar + %
2. **Leading**: party chip + votes + **margin** over 2nd
3. **Total valid votes** + rejected count
4. **Turnout**: accredited ÷ registered, among PUs that have reported

Then:
- **Party standings**: horizontal bar chart, sorted, party colours, votes + % labels. This replaces the video's 12 green tiles, which gave every party equal visual weight regardless of votes.
- **Vote share** donut (top 5 + "Others").
- **By LGA**: stacked bar per LGA (or a table on mobile), click to drill into Results.
- **Reporting over time**: line of PUs reported vs time.
- **Live feed**: last 20 submissions: PU name, LGA, agent, winner at that PU, time, status chip, and a 💬 marker if the agent left a comment. Click to open the submission.
- **Agent comments** panel: the latest comments on their own. These are often the first sign of trouble on the ground (violence, BVAS failure).
- **Needs attention**: count of flagged + unverified, with a button into the review queue.

### 8.5 Admin: Results drill-down
Breadcrumb `All · Lagos · Epe · Ward 03`. Same party-standings chart scoped to the current level, plus a table of child areas (reported/total, leader, margin, turnout). At PU level, the rows link to submissions. PUs that haven't reported show as "Awaiting" rows.

### 8.6 Admin: Submissions queue and detail
- Queue: filter chips (All / Flagged / Unverified / Verified), search by PU/agent, LGA filter, thumbnail per row.
- Detail: **side by side**. Left: result-sheet photo viewer (zoom, rotate, multiple photos). Right: the agent's comment (if any) in a callout at the top, then typed figures as editable inputs, auto totals, and flag banners explaining each problem ("Votes cast 312 > accredited 298"). Actions: **Save correction** (reason required), **Mark verified** (locks the sheet for the agent), **Flag**, **Un-verify**. Below: history timeline (submitted by agent 14:02 → corrected by admin 14:20: APC 120→102, "misread sheet").

### 8.7 Admin: Agents
- Table: name, username, phone, ward, PU, status (never logged in / active / submitted), last seen. Grouped or filterable by ward.
- **Coverage view**: for each ward, `PUs with agent / total PUs`, so the admin can see which polling units still need someone.
- **Add agent** drawer: name, phone, LGA → Ward → PU cascading selects (only PUs without an agent), username (pre-filled), auto-generated password (shown once, with copy and WhatsApp share).
- Bulk: CSV import (`name,phone,pu_code`) → rejects rows where the PU already has an agent → generates credentials → downloadable credentials sheet (CSV/printable) to hand out.
- Row actions: reset password, reassign, deactivate.
- Stat strip: `Agents 1,480 · Logged in 1,102 · Submitted 412`. Shows who has gone quiet.

### 8.8 Admin: Setup
Tabs:
- **Details**: rename, type, date, description, status (Setup / Live / Closed). Agents can only submit while it's Live.
- **Parties**: tick from the INEC list, add candidate names, reorder (ballot order). Colours come pre-filled and can be edited.
- **Locations**: a tree view (State › LGA › Ward › PU). The admin adds LGAs from the seeded list, **creates wards** under each LGA, then creates PUs under each ward with code, name and **registered voters**. Also available: CSV import with a preview and error rows before commit, and inline edit of registered voters. Each ward row shows its PU count, registered total and agent coverage.

### 8.9 Agent: mobile flow (the most important screen)
- **Home**: greeting, their one PU card (name, code, ward, LGA, registered voters) with status: *Not submitted* / *Submitted 14:02, you can still edit* / *Verified ✓, locked* / *Flagged, please check*. Big **Submit result** (or **Edit result**) button.
- **Submit: step 1, Photo**: "Take a clear photo of the result sheet". Uses `<input type="file" accept="image/*" capture="environment">`, which opens the camera directly. Compress → upload with a progress bar. Can add a second photo. Retake option.
- **Step 2, Figures**: one row per party (party colour chip, code, candidate), big numeric keypad inputs (`inputMode="numeric"`). Then accredited voters and rejected votes. Registered voters is shown read-only (the admin set it). Running total shown at the bottom.
- **Step 3, Review**: summary card, any warnings in plain language ("Total votes (312) is higher than accredited voters (298). Check the sheet."). Below that, an optional **Comment** box: "Anything happen at your polling unit? (optional)". The agent can still submit with warnings, which flags the sheet. **Submit**.
- **Resilience**: the draft (numbers + uploaded image URL) is saved to `localStorage` after every change, so a crash or lost signal doesn't lose the work. Submit retries safely thanks to `clientSubmissionId`. Location (GPS) is captured with permission and stored for admin reference.
- After submit: success screen. The agent can edit (figures, photos, comment) until the admin verifies; after that it's read-only.

---

## 9. Dashboard aggregation (how "live" works)

- `GET /api/election/stats?electionId=…`: one aggregation pipeline on `submissions` filtered by `{tenantId, electionId}` → `$unwind scores` → `$group` by party, plus a second facet for per-LGA totals and reporting counts. Returns a compact JSON (~a few KB).
- SWR polls every **10s** while the tab is visible (`refreshWhenHidden: false`), so an idle wall screen doesn't hammer Atlas.
- Flagged submissions **are counted** by default. A toggle "Verified only" gives the conservative figure. Both views are useful on election night.
- At expected scale (hundreds to low thousands of PUs per tenant) aggregation takes milliseconds with the indexes above. No caching layer needed yet.

---

## 10. Security checklist

- [ ] `tenantId` only from the session; every query uses the `scoped.ts` helpers
- [ ] Server actions re-verify role; agents can only write to their assigned PU IDs
- [ ] Passwords bcrypt (cost 12); never returned to the client after creation
- [ ] httpOnly + Secure cookie; `ELECTION_SESSION_SECRET` rotated per deployment environment
- [ ] EdgeStore `beforeUpload` checks session and path
- [ ] `/election` marked `noindex`, disallowed in robots
- [ ] Login rate limiting
- [ ] Tenant password hashes: if the GitHub repo is **public**, move `logins` out of `tenants.ts` into an env var (`ELECTION_TENANT_LOGINS` JSON) so hashes aren't published. *(Couldn't check visibility: gh CLI isn't authenticated.)*

---

## 11. Build phases

1. **Foundation**: route-group refactor (check that every existing page renders the same), deps, env, db connection, tenants config (NDC + LP), session + proxy, unified login, admin/agent shells with branded header.
2. **Elections + setup**: "My Election Monitorings" home, create wizard, parties (INEC seed), locations tree (state/LGA seed, admin-created wards + PUs with registered voters, CSV import).
3. **Agents**: CRUD with one-agent-per-PU enforcement, ward coverage view, credential generation, CSV bulk import, WhatsApp share.
4. **Agent submission**: EdgeStore wiring, 3-step mobile flow, drafts, flags, idempotency.
5. **Review**: submissions queue, side-by-side detail, corrections + audit history, verify/flag.
6. **Dashboard**: stats API, overview charts, drill-down, live feed, Situation Room theme, CSV export.
7. **Marketing entry points**: navbar pill, home section, services link, footer link.
8. **Hardening**: seed a fake election (e.g. 1 state, 5 LGAs, 300 PUs, 12 parties) and a script that simulates 50 agents submitting, to watch the dashboard update. Test on a real low-end Android over throttled 3G. Lighthouse on the agent flow.

---

## 12. Client decisions (confirmed 2026-09-29)

1. **Multiple elections per tenant: yes.** After sign-in, the admin creates and names an "election monitoring", then fills in its details. See §8.3.
2. **Wards: yes.** The admin creates wards (and the PUs under them) and assigns agents within them.
3. **One agent per polling unit.** Enforced with a unique index.
4. **Agents can edit until the admin verifies**, then the sheet is locked for them.
5. **Optional agent comment** on each submission, for explaining anything that happened. It isn't required. This covers incident reporting; there's no separate incident module.
6. **Two tenants at launch: NDC and LP.** LP = Labour Party. NDC is assumed to be the **National Democratic Congress**; confirm before the header text goes live. Still needed: both logos and brand colours, and the admin usernames/passwords (one login each unless told otherwise).
7. **Registered voters: the admin fills them in** per polling unit.
8. **Path, not subdomain:** `visionspeaks.com/election`.

Still open:
- Confirm NDC's full name, and provide both tenants' logos, colours and initial passwords.
- Hosting: is the live site on Vercel? (Needed for env vars and the Atlas network allowlist.)

---

## 13. Side finding (existing site, not in scope)

`globals.css` has no Tailwind v4 `@theme` block, so utility classes used throughout the site (`bg-primary`, `text-primary`, `text-textSecondary`, `bg-surface`, `border-border`, `bg-background`) should generate **no CSS**. That means buttons like "Get a Quote" and the hero CTA are probably rendering without their intended red fill. This comes from reading the code and hasn't been checked in a browser yet. Defining the tokens would visibly change the live site, so this is a separate decision for the client. The election module defines its own scoped tokens and isn't affected.
