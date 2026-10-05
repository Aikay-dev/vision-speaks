import Link from "next/link";
import { Plus, CalendarDays, Users, MapPin } from "lucide-react";
import { connectDB } from "@/lib/election/db";
import { Agent, Election, Location, Submission } from "@/lib/election/models";
import { requireAdmin } from "@/lib/election/session";
import { ELECTION_TYPE_LABELS } from "@/lib/election/constants";
import { buttonClass, fmt, PageHeader, StatusPill } from "@/components/election/ui";

export const metadata = { title: "My Election Monitorings" };

export default async function AdminHomePage() {
  const { session, tenant } = await requireAdmin();
  await connectDB();
  const elections = await Election.find({ tenantId: session.tenantId }).sort({ createdAt: -1 }).lean();
  const ids = elections.map((e) => e._id);
  const match = { tenantId: session.tenantId, electionId: { $in: ids } };

  const [pus, subs, agents] = await Promise.all([
    Location.aggregate([{ $match: { ...match, level: "pu" } }, { $group: { _id: "$electionId", n: { $sum: 1 } } }]),
    Submission.aggregate([{ $match: match }, { $group: { _id: "$electionId", n: { $sum: 1 } } }]),
    Agent.aggregate([{ $match: match }, { $group: { _id: "$electionId", n: { $sum: 1 } } }]),
  ]);
  const count = (rows: { _id: unknown; n: number }[], id: unknown) => rows.find((r) => String(r._id) === String(id))?.n ?? 0;

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title="My Election Monitorings"
        subtitle={`${tenant.name}: each monitoring has its own parties, locations, agents and results.`}
        action={
          elections.length > 0 && (
            <Link href="/election/admin/new" className={buttonClass("primary")}>
              <Plus className="size-4" /> New Election Monitoring
            </Link>
          )
        }
      />

      {elections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-el-border bg-el-surface px-6 py-16 text-center">
          <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-el-brand/10 text-el-brand">
            <Plus className="size-7" />
          </div>
          <h2 className="text-lg font-bold">Create your first election monitoring</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-el-muted">
            Name it, pick the states and LGAs you&apos;re covering and the parties on the ballot. Then add wards and polling units,
            and create accounts for your field agents.
          </p>
          <Link href="/election/admin/new" className={buttonClass("primary", "lg") + " mt-7"}>
            Get started
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {elections.map((e) => {
            const total = count(pus, e._id);
            const reported = count(subs, e._id);
            const progress = total ? reported / total : 0;
            return (
              <Link
                key={String(e._id)}
                href={`/election/admin/${e._id}`}
                className="group flex flex-col rounded-xl border border-el-border bg-el-surface p-5 transition hover:border-el-brand/50 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-medium uppercase tracking-wider text-el-muted">
                    {ELECTION_TYPE_LABELS[e.type]}
                  </span>
                  <StatusPill status={e.status} />
                </div>
                <h3 className="mt-2 text-lg font-bold leading-snug group-hover:text-el-brand">{e.name}</h3>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-el-muted">
                  {e.date && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3.5" />
                      {new Date(e.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {e.states.join(", ") || "No states yet"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3.5" />
                    {fmt(count(agents, e._id))} agents
                  </span>
                </div>
                <div className="mt-auto pt-5">
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-el-muted">Polling units reported</span>
                    <span className="num font-semibold">
                      {fmt(reported)} / {fmt(total)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-el-surface-2">
                    <div className="h-full rounded-full bg-el-brand" style={{ width: `${progress * 100}%` }} />
                  </div>
                </div>
              </Link>
            );
          })}
          <Link
            href="/election/admin/new"
            className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-el-border text-sm font-medium text-el-muted transition hover:border-el-brand hover:text-el-brand"
          >
            <Plus className="size-6" />
            New Election Monitoring
          </Link>
        </div>
      )}
    </main>
  );
}
