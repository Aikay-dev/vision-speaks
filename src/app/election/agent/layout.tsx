import Image from "next/image";
import { LogOut } from "lucide-react";
import { requireAgent } from "@/lib/election/session";
import { logout } from "@/app/election/actions";

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const { tenant } = await requireAgent();

  return (
    <div className="el-root" data-theme="light" style={{ ["--el-brand" as string]: tenant.brandColor }}>
      <header className="sticky top-0 z-30">
        <div className="bg-el-ink text-white">
          <div className="mx-auto flex h-14 max-w-xl items-center gap-3 px-4">
            <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-md bg-white p-0.5">
              <Image src={tenant.logo} alt={`${tenant.name} logo`} width={36} height={36} className="h-full w-full object-contain" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-extrabold tracking-wide">{tenant.shortName} ELECTION MONITORING</span>
              <span className="block text-[11px] text-white/55">Field agent</span>
            </span>
            <form action={logout} className="ml-auto">
              <button className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm text-white/75 hover:bg-white/10">
                <LogOut className="size-4" /> Sign out
              </button>
            </form>
          </div>
        </div>
        <div className="flex h-1">
          {tenant.stripe.map((c) => <span key={c} className="flex-1" style={{ background: c }} />)}
        </div>
      </header>
      <main className="mx-auto max-w-xl px-4 pb-16 pt-5">{children}</main>
      <footer className="pb-8 text-center text-[11px] text-el-muted">Powered by Visionspeaks Multimedia Ltd</footer>
    </div>
  );
}
