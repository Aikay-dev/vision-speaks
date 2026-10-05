"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { useLive } from "./useLive";
import { AreaTable, CommentsPanel, LiveFeed, PartyStandings, ReportingTimeline, ShareDonut, StatTiles, UpdatedAgo } from "./parts";
import { Card, cx, fmt } from "../ui";

export default function LiveDashboard({ electionId, status }: { electionId: string; status: string }) {
  const [verified, setVerified] = useState(false);
  const { data, error } = useLive(electionId, { verified });
  const base = `/election/admin/${electionId}`;

  if (!data) {
    return (
      <div className="grid h-64 place-items-center text-el-muted">
        {error ? <p className="text-sm text-el-danger">{error.message}</p> : <Loader2 className="size-6 animate-spin" />}
      </div>
    );
  }

  const s = data.summary;
  const attention = s.flagged + s.unverified;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <UpdatedAgo iso={data.updatedAt} error={Boolean(error)} />
        <div className="inline-flex rounded-lg border border-el-border bg-el-surface p-0.5 text-xs font-medium" role="group" aria-label="Which results to count">
          {[
            [false, "All submitted"],
            [true, "Verified only"],
          ].map(([v, l]) => (
            <button
              key={String(v)}
              onClick={() => setVerified(v as boolean)}
              className={cx("rounded-md px-3 py-1.5 transition", verified === v ? "bg-el-brand text-white" : "text-el-muted hover:text-el-text")}
              aria-pressed={verified === v}
            >
              {l as string}
            </button>
          ))}
        </div>
      </div>

      {status === "setup" && s.totalUnits === 0 && (
        <div className="rounded-xl border border-el-border bg-el-surface px-5 py-4 text-sm">
          <p className="font-semibold">This election is still being set up.</p>
          <p className="mt-1 text-el-muted">
            Add wards and polling units on <Link href={`${base}/setup`} className="font-medium text-el-brand underline">Setup</Link>,
            create <Link href={`${base}/agents`} className="font-medium text-el-brand underline">agents</Link>, then click Go live.
          </p>
        </div>
      )}

      <StatTiles data={data} />

      {attention > 0 && (
        <Link
          href={`${base}/submissions?status=${s.flagged ? "flagged" : "submitted"}`}
          className="flex items-center gap-3 rounded-xl border border-el-warn/30 bg-el-warn/5 px-5 py-3 text-sm hover:border-el-warn/60"
        >
          <AlertTriangle className="size-4 shrink-0 text-el-warn" />
          <span className="flex-1">
            <span className="font-semibold">{fmt(s.flagged)} flagged</span> and <span className="font-semibold">{fmt(s.unverified)} unverified</span> result
            sheets need checking.
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-el-warn">Review <ArrowRight className="size-4" /></span>
        </Link>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card title="Party standings">
          <PartyStandings parties={data.parties} totalValid={s.totalValidVotes} />
        </Card>
        <Card title="Vote share">
          <ShareDonut parties={data.parties} totalValid={s.totalValidVotes} />
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card title="Results by LGA" action={<Link href={`${base}/results`} className="text-xs font-semibold text-el-brand hover:underline">Drill down →</Link>}>
            <AreaTable areas={data.areas} hrefFor={(a) => `${base}/results?lga=${a.id}`} />
          </Card>
          <Card title="Polling units reporting over time">
            <ReportingTimeline timeline={data.timeline} totalUnits={s.totalUnits} />
          </Card>
        </div>
        <div className="space-y-5">
          <CommentsPanel feed={data.feed} electionId={electionId} />
          <Card title="Latest submissions" action={<Link href={`${base}/submissions`} className="text-xs font-semibold text-el-brand hover:underline">All →</Link>}>
            <div className="max-h-[420px] overflow-y-auto">
              <LiveFeed feed={data.feed} electionId={electionId} />
            </div>
          </Card>
          <Card title="Agents">
            <dl className="grid grid-cols-3 divide-x divide-el-border text-center">
              {[
                ["Active", data.agents.total],
                ["Signed in", data.agents.loggedIn],
                ["Submitted", data.agents.submitted],
              ].map(([l, v]) => (
                <div key={l} className="px-2 py-4">
                  <dt className="text-xs text-el-muted">{l}</dt>
                  <dd className="num mt-1 text-lg font-bold">{fmt(v as number)}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
