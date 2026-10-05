"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Camera, Lock, Activity } from "lucide-react";

// Illustrative only: generic parties, not real results.
const PREVIEW = [
  { code: "Party A", pct: 41, color: "#ef4444" },
  { code: "Party B", pct: 33, color: "#38bdf8" },
  { code: "Party C", pct: 17, color: "#a3e635" },
  { code: "Others", pct: 9, color: "#737373" },
];

export default function ElectionPortalSection() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-red-950/10 to-transparent" />
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <span className="mb-5 inline-block rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-red-400">
            Election Monitoring
          </span>
          <h2 className="mb-5 text-4xl font-bold leading-tight md:text-5xl">
            Live result collation, from every polling unit.
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-neutral-400">
            Our agents photograph each result sheet and enter the scores at the polling unit. Results are totalled
            for every ward, LGA and state as they arrive, and your coordinators verify each one against the photo.
          </p>
          <ul className="mb-10 space-y-3">
            {[
              [Camera, "Every result backed by a photo of the sheet"],
              [Activity, "Live dashboard: standings, turnout, reporting progress"],
              [Lock, "A private, branded portal for each client"],
            ].map(([Icon, text]) => {
              const I = Icon as typeof Camera;
              return (
                <li key={text as string} className="flex items-center gap-3 text-neutral-200">
                  <I className="h-5 w-5 shrink-0 text-red-500" />
                  {text as string}
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/election"
              className="group inline-flex items-center rounded-full bg-red-600 px-7 py-3.5 font-bold text-white transition hover:bg-red-500"
            >
              Access Portal <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/contact" className="inline-flex items-center rounded-full border border-white/20 px-7 py-3.5 font-bold text-white transition hover:border-white/50">
              Book monitoring for your party
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          aria-hidden
          className="glass-card rounded-2xl p-6 shadow-2xl shadow-black/40"
        >
          <div className="mb-5 flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-neutral-300">ELECTION MONITORING SYSTEM</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Live
            </span>
          </div>
          <div className="mb-5 grid grid-cols-3 gap-3">
            {[
              ["Reported", "1,284 / 1,526"],
              ["Valid votes", "412,907"],
              ["Turnout", "38.4%"],
            ].map(([l, v]) => (
              <div key={l} className="rounded-xl bg-neutral-900/80 p-3">
                <div className="text-[10px] uppercase tracking-wider text-neutral-500">{l}</div>
                <div className="mt-1 text-sm font-bold tabular-nums text-white sm:text-base">{v}</div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {PREVIEW.map((p, i) => (
              <div key={p.code} className="flex items-center gap-3">
                <span className="w-16 text-xs font-semibold text-neutral-300">{p.code}</span>
                <div className="h-6 flex-1 overflow-hidden rounded-r bg-neutral-900">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${p.pct * 2.2}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 + i * 0.12, ease: "easeOut" }}
                    className="h-full rounded-r"
                    style={{ background: p.color }}
                  />
                </div>
                <span className="w-10 text-right text-xs tabular-nums text-neutral-400">{p.pct}%</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/5 bg-neutral-900/60 p-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-neutral-800">
              <Camera className="h-4 w-4 text-neutral-400" />
            </div>
            <div className="min-w-0 text-xs">
              <div className="font-semibold text-neutral-200">Ward 04 · PU 012: result sheet received</div>
              <div className="text-neutral-500">Photo attached · awaiting verification · 12s ago</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
