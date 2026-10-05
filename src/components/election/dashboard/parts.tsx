"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AreaRow, LiveStats, PartyTotal } from "@/lib/election/stats";
import { PartyLogo } from "../PartyEditor";
import { Card, cx, EmptyState, fmt, PartyChip, pct, StatusPill, timeAgo } from "../ui";

/** A number that briefly tints when its value changes. */
export function LiveNumber({ value, className, format = fmt }: { value: number; className?: string; format?: (n: number) => string }) {
  // Derived from props during render (React's recommended alternative to an effect).
  const [prev, setPrev] = useState(value);
  const [flash, setFlash] = useState(0);
  if (prev !== value) {
    setPrev(value);
    setFlash(flash + 1);
  }
  return (
    <span key={flash} className={cx("num rounded", flash > 0 && "el-flash", className)}>
      {format(value)}
    </span>
  );
}

export function UpdatedAgo({ iso, error }: { iso?: string; error?: boolean }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="inline-flex items-center gap-2 text-xs text-el-muted" aria-live="polite">
      <span className={cx("el-live-dot size-2 rounded-full", error ? "bg-el-danger" : "bg-el-ok")} />
      {error ? "Connection problem, retrying…" : iso ? `Updated ${timeAgo(iso)}` : "Loading…"}
    </span>
  );
}

export function StatTiles({ data }: { data: LiveStats }) {
  const s = data.summary;
  const [first, second] = data.parties;
  const leading = first && first.votes > 0 ? first : null;
  const margin = leading ? leading.votes - (second?.votes ?? 0) : 0;
  const turnout = s.registeredVotersReported ? s.accreditedVoters / s.registeredVotersReported : 0;
  const reportPct = s.totalUnits ? s.reportedUnits / s.totalUnits : 0;

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <Tile label="Polling units reported">
        <div className="text-2xl font-bold sm:text-3xl">
          <LiveNumber value={s.reportedUnits} />
          <span className="text-base font-medium text-el-muted"> / {fmt(s.totalUnits)}</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-el-surface-2">
          <div className="h-full rounded-full bg-el-brand transition-all duration-700" style={{ width: `${reportPct * 100}%` }} />
        </div>
        <p className="num mt-1.5 text-xs text-el-muted">{pct(reportPct)} reporting</p>
      </Tile>
      <Tile label="Leading">
        {leading ? (
          <>
            <div className="flex items-center gap-2.5">
              <PartyLogo party={leading} size={32} />
              <span className="text-2xl font-bold sm:text-3xl">{leading.code}</span>
            </div>
            <p className="mt-2 text-xs text-el-muted">
              Ahead by <LiveNumber value={margin} className="font-semibold text-el-text" /> votes
              {second && second.votes > 0 && <> over {second.code}</>}
            </p>
          </>
        ) : (
          <p className="text-sm text-el-muted">No votes yet</p>
        )}
      </Tile>
      <Tile label="Valid votes">
        <div className="text-2xl font-bold sm:text-3xl"><LiveNumber value={s.totalValidVotes} /></div>
        <p className="mt-2 text-xs text-el-muted">
          <LiveNumber value={s.rejectedVotes} /> rejected
        </p>
      </Tile>
      <Tile label="Turnout (reported PUs)">
        <div className="text-2xl font-bold sm:text-3xl">
          <LiveNumber value={turnout} format={(n) => pct(n)} />
        </div>
        <p className="mt-2 text-xs text-el-muted">
          {fmt(s.accreditedVoters)} accredited of {fmt(s.registeredVotersReported)} registered
        </p>
      </Tile>
    </div>
  );
}

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-el-border bg-el-surface p-4 sm:p-5">
      <p className="mb-2 text-xs font-medium text-el-muted">{label}</p>
      {children}
    </div>
  );
}

/**
 * Sorted horizontal bars, direct-labelled with code + logo so identity never
 * relies on colour alone (several party colours sit close for colour-blind readers).
 */
export function PartyStandings({ parties, totalValid }: { parties: PartyTotal[]; totalValid: number }) {
  const max = Math.max(1, ...parties.map((p) => p.votes));
  if (!parties.length) return <EmptyState title="No parties set up" />;
  return (
    <ol className="space-y-2.5 p-5">
      {parties.map((p, i) => (
        <li key={p.id} className="group grid grid-cols-[auto_4.5rem_1fr_auto] items-center gap-3" title={`${p.name}${p.candidateName ? ` · ${p.candidateName}` : ""}: ${fmt(p.votes)} votes (${pct(p.share)})`}>
          <span className="num w-4 text-right text-xs text-el-muted">{i + 1}</span>
          <span className="flex items-center gap-2">
            <PartyLogo party={p} size={22} />
            <span className="text-sm font-bold">{p.code}</span>
          </span>
          <div className="relative h-7 overflow-hidden rounded-r-[4px] bg-el-surface-2">
            <div
              className="h-full rounded-r-[4px] transition-[width] duration-700 ease-out group-hover:brightness-110"
              style={{ width: `${(p.votes / max) * 100}%`, background: p.color, minWidth: p.votes ? 3 : 0 }}
            />
            {p.candidateName && (
              <span className="absolute inset-y-0 left-2 hidden items-center truncate text-[11px] font-medium text-el-text/70 sm:flex" style={{ maxWidth: "70%" }}>
                <span className="rounded bg-el-surface/85 px-1">{p.candidateName}</span>
              </span>
            )}
          </div>
          <span className="w-28 text-right">
            <LiveNumber value={p.votes} className="text-sm font-semibold" />
            <span className="num ml-1.5 text-xs text-el-muted">{totalValid ? pct(p.share) : "–"}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function ShareDonut({ parties, totalValid }: { parties: PartyTotal[]; totalValid: number }) {
  const top = parties.filter((p) => p.votes > 0).slice(0, 5);
  const other = parties.slice(5).reduce((s, p) => s + p.votes, 0);
  const data = [...top.map((p) => ({ name: p.code, value: p.votes, color: p.color })), ...(other ? [{ name: "Others", value: other, color: "#94A3B8" }] : [])];
  if (!totalValid) return <EmptyState title="No votes yet" body="The share chart fills in as results arrive." />;
  return (
    <div className="flex flex-col items-center gap-4 p-5 sm:flex-row lg:flex-col 2xl:flex-row">
      <div className="relative size-44 shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius="64%" outerRadius="100%" paddingAngle={1} stroke="var(--el-surface)" strokeWidth={2} isAnimationActive={false}>
              {data.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Pie>
            <Tooltip content={<ChartTip total={totalValid} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="num text-lg font-bold">{fmt(totalValid)}</div>
            <div className="text-[10px] uppercase tracking-wider text-el-muted">valid votes</div>
          </div>
        </div>
      </div>
      <ul className="w-full space-y-1.5 text-sm">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-3">
            <PartyChip code={d.name} color={d.color} className="text-sm" />
            <span className="num text-el-muted">{pct(d.value / totalValid)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChartTip({ active, payload, total }: { active?: boolean; payload?: { name: string; value: number }[]; total: number }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg border border-el-border bg-el-surface px-3 py-2 text-xs shadow-lg">
      <div className="font-semibold">{p.name}</div>
      <div className="num text-el-muted">{fmt(p.value)} votes · {pct(p.value / total)}</div>
    </div>
  );
}

export function ReportingTimeline({ timeline, totalUnits }: { timeline: LiveStats["timeline"]; totalUnits: number }) {
  const data = timeline.reduce<{ t: string; reported: number }[]>(
    (acc, t) => [...acc, { t: t.t, reported: (acc.at(-1)?.reported ?? 0) + t.count }],
    [],
  );
  const cum = data.at(-1)?.reported ?? 0;
  if (data.length < 2) return <EmptyState title="Not enough data yet" body="This shows polling units reporting over time once results start coming in." />;
  const time = (iso: string) => new Date(iso).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="h-56 p-3 pr-5">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, left: 0, right: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="el-rep" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--el-brand)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--el-brand)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--el-border)" strokeDasharray="3 3" />
          <XAxis dataKey="t" tickFormatter={time} tick={{ fontSize: 11, fill: "var(--el-muted)" }} axisLine={false} tickLine={false} minTickGap={40} />
          <YAxis domain={[0, Math.max(totalUnits, cum)]} tick={{ fontSize: 11, fill: "var(--el-muted)" }} axisLine={false} tickLine={false} width={44} allowDecimals={false} />
          <Tooltip
            cursor={{ stroke: "var(--el-muted)", strokeDasharray: "3 3" }}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div className="rounded-lg border border-el-border bg-el-surface px-3 py-2 text-xs shadow-lg">
                  <div className="font-semibold">{time(String(payload[0].payload.t))}</div>
                  <div className="num text-el-muted">{fmt(Number(payload[0].value))} of {fmt(totalUnits)} PUs reported</div>
                </div>
              ) : null
            }
          />
          <Area type="monotone" dataKey="reported" stroke="var(--el-brand)" strokeWidth={2} fill="url(#el-rep)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const LEVEL_LABEL = { lga: "LGA", ward: "Ward", pu: "Polling unit" } as const;

export function AreaTable({ areas, hrefFor }: { areas: AreaRow[]; hrefFor: (a: AreaRow) => string | null }) {
  if (!areas.length) return <EmptyState title="Nothing here yet" body="Add locations on the Setup page." />;
  const level = areas[0].level;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-el-surface-2 text-left text-xs text-el-muted">
          <tr>
            <th className="px-4 py-2.5 font-medium">{LEVEL_LABEL[level]}</th>
            <th className="px-4 py-2.5 text-right font-medium">{level === "pu" ? "Status" : "Reported"}</th>
            <th className="px-4 py-2.5 font-medium">Leading</th>
            <th className="px-4 py-2.5 text-right font-medium">Margin</th>
            <th className="hidden px-4 py-2.5 text-right font-medium sm:table-cell">Valid votes</th>
            <th className="hidden px-4 py-2.5 text-right font-medium md:table-cell">Turnout</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-el-border">
          {areas.map((a) => {
            const href = hrefFor(a);
            const reportedPct = a.totalUnits ? a.reportedUnits / a.totalUnits : 0;
            return (
              <tr key={a.id} className={cx(href && "cursor-pointer hover:bg-el-surface-2")}>
                <td className="px-4 py-2.5 font-medium">
                  {href ? <Link href={href} className="hover:text-el-brand">{a.name}</Link> : a.name}
                </td>
                <td className="num px-4 py-2.5 text-right">
                  {level === "pu" ? (
                    a.status ? <StatusPill status={a.status} /> : <span className="text-xs text-el-muted">Awaiting</span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <span className="hidden h-1.5 w-14 overflow-hidden rounded-full bg-el-surface-2 sm:inline-block">
                        <span className="block h-full bg-el-brand" style={{ width: `${reportedPct * 100}%` }} />
                      </span>
                      {fmt(a.reportedUnits)}/{fmt(a.totalUnits)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5">{a.leader ? <PartyChip code={a.leader.code} color={a.leader.color} /> : <span className="text-el-muted">–</span>}</td>
                <td className="num px-4 py-2.5 text-right">{a.leader ? fmt(a.margin) : "–"}</td>
                <td className="num hidden px-4 py-2.5 text-right sm:table-cell">{fmt(a.totalValidVotes)}</td>
                <td className="num hidden px-4 py-2.5 text-right text-el-muted md:table-cell">
                  {a.registeredVoters && a.reportedUnits ? pct(a.accreditedVoters / a.registeredVoters) : "–"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function LiveFeed({ feed, electionId }: { feed: LiveStats["feed"]; electionId: string }) {
  if (!feed.length) return <EmptyState title="No submissions yet" body="Results appear here as agents submit them." />;
  return (
    <ul className="divide-y divide-el-border">
      {feed.map((f) => (
        <li key={f.id}>
          <Link href={`/election/admin/${electionId}/submissions/${f.id}`} className="flex items-start gap-3 px-5 py-3 hover:bg-el-surface-2">
            <span className="mt-1 size-2.5 shrink-0 rounded-sm" style={{ background: f.winner?.color ?? "var(--el-border)" }} />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">{f.puName}</span>
                {f.hasComment && <MessageSquare className="size-3.5 shrink-0 text-el-brand" aria-label="Has agent comment" />}
              </span>
              <span className="block truncate text-xs text-el-muted">
                {f.wardName} · {f.lgaName} · {f.agentName}
              </span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1">
              <StatusPill status={f.status} />
              <span className="text-[11px] text-el-muted">
                {f.winner ? `${f.winner.code} leads · ` : ""}
                {timeAgo(f.at)}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function CommentsPanel({ feed, electionId }: { feed: LiveStats["feed"]; electionId: string }) {
  const withComments = feed.filter((f) => f.hasComment).slice(0, 6);
  return (
    <Card title={<span className="inline-flex items-center gap-2"><MessageSquare className="size-4" /> Agent comments</span>}>
      {withComments.length === 0 ? (
        <p className="px-5 py-6 text-center text-sm text-el-muted">No comments in the latest submissions.</p>
      ) : (
        <ul className="divide-y divide-el-border">
          {withComments.map((f) => (
            <li key={f.id}>
              <Link href={`/election/admin/${electionId}/submissions/${f.id}`} className="block px-5 py-3 hover:bg-el-surface-2">
                <p className="line-clamp-3 text-sm">&ldquo;{f.comment}&rdquo;</p>
                <p className="mt-1 text-xs text-el-muted">{f.puName} · {f.agentName} · {timeAgo(f.at)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
