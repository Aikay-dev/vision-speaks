"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Camera, ClipboardCheck, MapPin, MonitorPlay, ShieldAlert, Smartphone, Tv, Users } from "lucide-react";

const STEPS = [
  {
    icon: MapPin,
    title: "We set up your election",
    body: "Your states, LGAs, wards and polling units go into the system, along with every party on the ballot and the number of registered voters at each unit.",
  },
  {
    icon: Users,
    title: "An agent at every polling unit",
    body: "Each agent gets their own login and is tied to one polling unit. They only see and submit results for their own unit.",
  },
  {
    icon: Camera,
    title: "Photo of the sheet, scores from the sheet",
    body: "When counting ends, the agent photographs the signed result sheet and types in each party's score from their phone. It takes a couple of minutes.",
  },
  {
    icon: MonitorPlay,
    title: "You watch it come in, live",
    body: "Every submission is added to the totals within seconds: by polling unit, ward, LGA and state. Your coordinators check each figure against its photo.",
  },
];

const FEATURES = [
  {
    icon: ShieldAlert,
    title: "Figures that don't add up get flagged",
    body: "More votes than accredited voters? Turnout above 95%? A missing photo? The system flags the sheet for review, so mistakes and manipulation are caught early.",
  },
  {
    icon: Camera,
    title: "Every result has evidence",
    body: "No score is trusted on its own. Each one sits next to the photo of the sheet it came from, ready to open and check.",
  },
  {
    icon: Smartphone,
    title: "Built for the field",
    body: "Agents use an ordinary phone. Photos are compressed before upload so they go through on weak signal, and a result can be edited until it's verified.",
  },
  {
    icon: ClipboardCheck,
    title: "Verified results, kept separate",
    body: "Switch the dashboard between everything submitted and only what your team has verified, so you always know which numbers are solid.",
  },
  {
    icon: Tv,
    title: "A live board for the war room",
    body: "A full-screen scoreboard for a TV or projector. The party bars grow as results arrive, so everyone in the room sees the same picture.",
  },
  {
    icon: Users,
    title: "Private to your party",
    body: "Each client gets their own branded portal and their own data. Nothing is shared between parties.",
  },
];

export default function ElectionHowItWorks() {
  return (
    <>
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">How election monitoring works</h2>
            <p className="text-lg leading-relaxed text-neutral-400">
              On election day, the result that matters is the one written on the sheet at the polling unit. We get that
              number from the polling unit to your dashboard, with the evidence attached, before anyone has a chance to
              change it.
            </p>
          </div>
          <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card relative rounded-2xl p-7"
              >
                <span className="absolute right-5 top-4 text-5xl font-black text-white/5">{i + 1}</span>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                  <s.icon className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="mb-3 text-lg font-bold">{s.title}</h3>
                <p className="leading-relaxed text-neutral-400">{s.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-surface/30 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <h2 className="mb-4 text-4xl font-bold">Why parties choose Visionspeaks</h2>
            <p className="text-lg text-neutral-400">
              Collating results is the part of an election that can't afford to be slow, or wrong.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.08 }}
                className="rounded-2xl border border-white/10 bg-neutral-900/40 p-7"
              >
                <f.icon className="mb-4 h-7 w-7 text-red-500" />
                <h3 className="mb-2 text-lg font-bold">{f.title}</h3>
                <p className="leading-relaxed text-neutral-400">{f.body}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-950/30 to-transparent p-10 text-center md:p-14">
            <h3 className="mb-3 text-3xl font-bold md:text-4xl">Election season is here. Be ready.</h3>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-neutral-400">
              Setting up takes time: locations, agents, training. Talk to us early so your team is in place before the
              first vote is cast.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="group inline-flex items-center rounded-full bg-red-600 px-8 py-4 font-bold text-white transition hover:bg-red-500"
              >
                Book election monitoring <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/election" className="inline-flex items-center rounded-full border border-white/20 px-8 py-4 font-bold text-white transition hover:border-white/50">
                Access the portal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
