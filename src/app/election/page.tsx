import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Camera, ShieldCheck, Activity } from "lucide-react";
import logo from "@/assets/logo.png";
import { getSession } from "@/lib/election/session";
import LoginForm from "@/components/election/LoginForm";

export const metadata = { title: { absolute: "Sign in · Election Monitoring Portal" } };

export default async function ElectionPortalPage() {
  const session = await getSession();
  if (session?.role === "admin") redirect("/election/admin");
  if (session?.role === "agent") redirect("/election/agent");

  return (
    <div className="el-root grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      {/* Left: brand panel (desktop) / band (mobile) */}
      <aside className="relative overflow-hidden bg-el-ink text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div aria-hidden className="absolute -left-40 top-1/3 size-[520px] rounded-full bg-red-600/20 blur-[120px]" />

        <div className="relative flex h-full flex-col justify-between gap-10 px-6 py-8 sm:px-10 lg:px-14 lg:py-12">
          <Link href="/" className="flex items-center gap-3">
            <Image src={logo} alt="" height={36} className="h-9 w-auto" />
            <div className="leading-none">
              <div className="text-sm font-bold tracking-tight">VISIONSPEAKS</div>
              <div className="mt-1 text-[10px] tracking-[0.2em] text-white/60">MULTIMEDIA LTD</div>
            </div>
          </Link>

          <div className="hidden max-w-lg lg:block">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
              Election Monitoring Portal
            </p>
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight xl:text-5xl">
              Every polling unit.
              <br />
              Every result sheet.
              <br />
              <span className="text-white/50">Verified.</span>
            </h1>
            <ul className="mt-10 space-y-4 text-sm text-white/75">
              <li className="flex gap-3">
                <Camera className="size-5 shrink-0 text-red-400" />
                Field agents photograph the result sheet and enter the scores at the polling unit.
              </li>
              <li className="flex gap-3">
                <Activity className="size-5 shrink-0 text-red-400" />
                Results are collated as they arrive, from polling unit up to ward, LGA and state.
              </li>
              <li className="flex gap-3">
                <ShieldCheck className="size-5 shrink-0 text-red-400" />
                Coordinators check each figure against the photo before it is verified.
              </li>
            </ul>
          </div>

          <p className="hidden text-xs text-white/40 lg:block">© {new Date().getFullYear()} Visionspeaks Multimedia Ltd</p>
        </div>
      </aside>

      {/* Right: sign-in */}
      <main className="flex items-start justify-center px-5 py-10 sm:items-center sm:px-10">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold tracking-tight">Sign in</h2>
          <p className="mt-1.5 text-sm text-el-muted">Coordinators and field agents both sign in here.</p>
          <LoginForm />
          <p className="mt-8 rounded-lg border border-el-border bg-el-surface px-4 py-3 text-xs leading-relaxed text-el-muted">
            <span className="font-semibold text-el-text">Field agents:</span> use the username and password your
            coordinator gave you. If you have lost them, ask your coordinator to reset your password.
          </p>
          <Link href="/" className="mt-6 inline-block text-xs text-el-muted hover:text-el-text">
            ← Back to visionspeaks.com
          </Link>
        </div>
      </main>
    </div>
  );
}
