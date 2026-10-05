import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, Lock, MapPin, MessageSquare } from "lucide-react";
import { requireAgent } from "@/lib/election/session";
import { connectDB } from "@/lib/election/db";
import { Agent, Election, Location, Party, Submission } from "@/lib/election/models";
import { buttonClass, cx, fmt, timeAgo } from "@/components/election/ui";
import { PartyLogo } from "@/components/election/PartyEditor";

export const metadata = { title: "My polling unit" };

export default async function AgentHomePage() {
  const { session } = await requireAgent();
  await connectDB();
  const agent = await Agent.findOne({ _id: session.sub, tenantId: session.tenantId }).lean();
  if (!agent) return <p className="text-sm text-el-muted">Account not found. Sign out and sign in again.</p>;
  const base = { tenantId: agent.tenantId, electionId: agent.electionId };

  const [election, locs, sub, parties] = await Promise.all([
    Election.findOne({ _id: agent.electionId, tenantId: agent.tenantId }).lean(),
    Location.find({ ...base, _id: { $in: [agent.pollingUnitId, agent.wardId, agent.lgaId] } }).lean(),
    Submission.findOne({ ...base, pollingUnitId: agent.pollingUnitId }).lean(),
    Party.find(base).sort({ order: 1 }).lean(),
  ]);
  const loc = (id: unknown) => locs.find((l) => String(l._id) === String(id));
  const pu = loc(agent.pollingUnitId);
  const firstName = agent.name.split(" ")[0];
  const lastFlag = sub?.status === "flagged" ? [...sub.history].reverse().find((h) => h.action === "flagged" && h.by?.role === "admin") : undefined;
  const open = election?.status === "live";
  const canEdit = open && sub?.status !== "verified";
  const votes = new Map(sub?.scores.map((s) => [String(s.partyId), s.votes]));

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-el-muted">Welcome,</p>
        <h1 className="text-2xl font-bold tracking-tight">{firstName}</h1>
        {election && <p className="mt-0.5 text-sm text-el-muted">{election.name}</p>}
      </div>

      <section className="rounded-2xl border border-el-border bg-el-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-el-muted">Your polling unit</p>
        <h2 className="mt-1 text-xl font-bold leading-snug">{pu?.name}</h2>
        <p className="mt-1 flex items-start gap-1.5 text-sm text-el-muted">
          <MapPin className="mt-0.5 size-4 shrink-0" />
          {[pu?.code, loc(agent.wardId)?.name, loc(agent.lgaId)?.name, pu?.state].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-el-surface-2 px-4 py-3 text-sm">
          <span className="text-el-muted">Registered voters</span>
          <span className="num font-bold">{fmt(pu?.registeredVoters ?? 0)}</span>
        </div>
      </section>

      {/* Status */}
      {!open && !sub && (
        <StatusCard tone="muted" icon={Clock} title={election?.status === "closed" ? "Submission has closed" : "Submission hasn't opened yet"}>
          {election?.status === "closed"
            ? "This election is closed. Contact your coordinator if you have a problem."
            : "Your coordinator will open result submission on election day. Check back then."}
        </StatusCard>
      )}
      {!open && sub && sub.status !== "verified" && (
        <StatusCard tone="muted" icon={Lock} title="Submission has closed">
          You can no longer edit your result. Your coordinator is reviewing it.
        </StatusCard>
      )}
      {sub?.status === "verified" && (
        <StatusCard tone="ok" icon={Lock} title="Verified by your coordinator">
          Your result has been checked and locked. Thank you!
        </StatusCard>
      )}
      {open && sub?.status === "flagged" && (
        <StatusCard tone="warn" icon={AlertTriangle} title="Please check your result">
          {lastFlag?.reason ? <>Your coordinator says: &ldquo;{lastFlag.reason}&rdquo;</> : "Some figures don't add up. Compare them with the result sheet and edit if needed."}
        </StatusCard>
      )}
      {open && sub?.status === "submitted" && (
        <StatusCard tone="ok" icon={CheckCircle2} title={`Submitted ${timeAgo(sub.updatedAt)}`}>
          You can still edit it until your coordinator verifies it.
        </StatusCard>
      )}

      {canEdit && (
        <Link href="/election/agent/submit" className={cx(buttonClass("primary", "lg"), "w-full text-lg")}>
          {sub ? "Edit result" : "Submit result"}
        </Link>
      )}

      {sub && (
        <section className="overflow-hidden rounded-2xl border border-el-border bg-el-surface">
          <p className="border-b border-el-border px-5 py-3 text-sm font-semibold">What you submitted</p>
          <ul className="divide-y divide-el-border">
            {parties.map((p) => (
              <li key={String(p._id)} className="flex items-center gap-3 px-5 py-2.5">
                <PartyLogo party={{ code: p.code, color: p.color, logo: p.logo ?? "" }} size={26} />
                <span className="flex-1 text-sm font-semibold">{p.code}</span>
                <span className="num font-bold">{fmt(votes.get(String(p._id)) ?? 0)}</span>
              </li>
            ))}
          </ul>
          <dl className="grid grid-cols-3 border-t border-el-border bg-el-surface-2 text-center text-xs">
            {[
              ["Accredited", sub.accreditedVoters],
              ["Rejected", sub.rejectedVotes],
              ["Valid votes", sub.totalValidVotes],
            ].map(([l, v]) => (
              <div key={l as string} className="px-2 py-3">
                <dt className="text-el-muted">{l}</dt>
                <dd className="num mt-0.5 text-base font-bold">{fmt(v as number)}</dd>
              </div>
            ))}
          </dl>
          {sub.comment && (
            <p className="flex gap-2 border-t border-el-border px-5 py-3 text-sm text-el-muted">
              <MessageSquare className="mt-0.5 size-4 shrink-0" /> {sub.comment}
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function StatusCard({ tone, icon: Icon, title, children }: { tone: "ok" | "warn" | "muted"; icon: typeof Clock; title: string; children: React.ReactNode }) {
  return (
    <section
      className={cx(
        "flex gap-3 rounded-2xl border p-4",
        tone === "ok" && "border-el-ok/30 bg-el-ok/5",
        tone === "warn" && "border-el-warn/40 bg-el-warn/10",
        tone === "muted" && "border-el-border bg-el-surface",
      )}
    >
      <Icon className={cx("mt-0.5 size-5 shrink-0", tone === "ok" ? "text-el-ok" : tone === "warn" ? "text-el-warn" : "text-el-muted")} />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-sm text-el-muted">{children}</p>
      </div>
    </section>
  );
}
