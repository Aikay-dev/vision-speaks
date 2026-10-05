"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Maximize2 } from "lucide-react";
import { motion } from "framer-motion";
import type { PublicTenant } from "@/lib/election/tenants";
import { useLive } from "./useLive";
import { LiveNumber } from "./parts";
import { PartyLogo } from "../PartyEditor";
import { fmt, pct } from "../ui";

/** Full-screen live scoreboard: vertical party bars that grow as results arrive. Refreshes every 5s. */
export default function TvBoard({ electionId, electionName, tenant }: { electionId: string; electionName: string; tenant: PublicTenant }) {
  const { data, error } = useLive(electionId, { refreshMs: 5_000 });
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!data) {
    return (
      <div className="grid min-h-dvh place-items-center text-el-muted">
        {error ? <p className="text-el-danger">{error.message}</p> : <Loader2 className="size-10 animate-spin" />}
      </div>
    );
  }

  const s = data.summary;
  const parties = data.parties;
  const max = Math.max(1, ...parties.map((p) => p.votes));
  const reportPct = s.totalUnits ? s.reportedUnits / s.totalUnits : 0;
  const turnout = s.registeredVotersReported ? s.accreditedVoters / s.registeredVotersReported : 0;
  const [first, second] = parties;
  const margin = first && first.votes > 0 ? first.votes - (second?.votes ?? 0) : 0;
  const dense = parties.length > 8;

  const tiles: { label: string; value: React.ReactNode; sub: string }[] = [
    {
      label: "Polling units reported",
      value: (
        <>
          <LiveNumber value={s.reportedUnits} />
          <span className="text-el-muted"> / {fmt(s.totalUnits)}</span>
        </>
      ),
      sub: `${pct(reportPct)} reporting`,
    },
    { label: "Valid votes counted", value: <LiveNumber value={s.totalValidVotes} />, sub: `${fmt(s.rejectedVotes)} rejected` },
    {
      label: "Leading",
      value: first && first.votes > 0 ? <span style={{ color: first.color }}>{first.code}</span> : <span className="text-el-muted">–</span>,
      sub: first && first.votes > 0 ? `Ahead by ${fmt(margin)}` : "No votes yet",
    },
    { label: "Turnout (reported PUs)", value: <LiveNumber value={turnout} format={(n) => pct(n)} />, sub: `${fmt(s.accreditedVoters)} accredited` },
  ];

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-el-bg text-el-text">
      <header className="flex items-center gap-5 bg-el-ink px-[2vw] py-[1.2vh] text-white">
        <span className="grid size-[6vh] shrink-0 place-items-center overflow-hidden rounded-md bg-white p-0.5">
          <Image src={tenant.logo} alt={`${tenant.name} logo`} width={64} height={64} className="h-full w-full object-contain" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[clamp(14px,1.9vw,34px)] font-extrabold tracking-wide">{tenant.headerTitle}</p>
          <p className="truncate text-[clamp(11px,1.1vw,20px)] text-white/60">{electionName}</p>
        </div>
        <div className="flex items-center gap-6 text-right">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[clamp(12px,1.2vw,22px)] font-bold tracking-widest">
            <span className={`el-live-dot size-[1.1vh] rounded-full ${error ? "bg-el-danger" : "bg-el-ok"}`} />
            {error ? "RECONNECTING" : "LIVE"}
          </span>
          <span className="num hidden text-[clamp(14px,1.6vw,30px)] font-semibold tabular-nums sm:block">
            {now ? now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : ""}
          </span>
        </div>
        <div className="flex gap-1 opacity-60 transition hover:opacity-100">
          <Link href={`/election/admin/${electionId}`} aria-label="Back to dashboard" className="grid size-9 place-items-center rounded-lg hover:bg-white/10">
            <ArrowLeft className="size-5" />
          </Link>
          <button
            aria-label="Toggle full screen"
            className="grid size-9 place-items-center rounded-lg hover:bg-white/10"
            onClick={() => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen())}
          >
            <Maximize2 className="size-5" />
          </button>
        </div>
      </header>
      <div className="flex h-1 shrink-0">
        {tenant.stripe.map((c) => (
          <span key={c} className="flex-1" style={{ background: c }} />
        ))}
      </div>

      <section className="grid shrink-0 grid-cols-4 divide-x divide-el-border border-b border-el-border bg-el-surface text-center">
        {tiles.map((t) => (
          <div key={t.label} className="px-3 py-[1.2vh]">
            <p className="text-[clamp(10px,1vw,18px)] font-medium uppercase tracking-wider text-el-muted">{t.label}</p>
            <p className="num text-[clamp(20px,3vw,56px)] font-extrabold leading-tight">{t.value}</p>
            <p className="num text-[clamp(10px,1vw,18px)] text-el-muted">{t.sub}</p>
          </div>
        ))}
      </section>

      <main className="flex min-h-0 flex-1 gap-[1vw] px-[2vw] pb-[1.5vh] pt-[2vh]">
        {parties.length === 0 && <p className="m-auto text-el-muted">No parties set up.</p>}
        {parties.map((p) => (
          <motion.div key={p.id} layout transition={{ type: "spring", stiffness: 260, damping: 30 }} className="flex min-w-0 flex-1 flex-col">
            <div className="relative min-h-0 flex-1 border-b-2 border-el-border">
              <div
                className="absolute inset-x-[12%] bottom-0 rounded-t-md transition-[height] duration-1000 ease-out"
                style={{ height: `${(p.votes / max) * 82}%`, minHeight: p.votes ? 4 : 0, background: p.color }}
              >
                <div className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap text-center leading-tight">
                  <div className={`num font-extrabold ${dense ? "text-[clamp(11px,1.5vw,28px)]" : "text-[clamp(14px,2.4vw,46px)]"}`}>
                    <LiveNumber value={p.votes} />
                  </div>
                  <div className={`num text-el-muted ${dense ? "text-[clamp(9px,0.9vw,16px)]" : "text-[clamp(11px,1.3vw,24px)]"}`}>
                    {s.totalValidVotes ? pct(p.share) : "–"}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 pt-[1vh]">
              <PartyLogo party={p} size={dense ? 36 : 56} />
              <span className={`font-extrabold ${dense ? "text-[clamp(10px,1.1vw,20px)]" : "text-[clamp(14px,1.8vw,34px)]"}`}>{p.code}</span>
            </div>
          </motion.div>
        ))}
      </main>
    </div>
  );
}
