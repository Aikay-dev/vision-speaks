import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/election/session";
import { toPublicTenant } from "@/lib/election/tenants";
import AdminHeader from "@/components/election/AdminHeader";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { tenant } = await requireAdmin();
  const theme = (await cookies()).get("vs_el_theme")?.value === "dark" ? "dark" : "light";

  return (
    <div className="el-root" data-theme={theme} style={{ ["--el-brand" as string]: tenant.brandColor }}>
      <AdminHeader tenant={toPublicTenant(tenant)} initialTheme={theme} />
      {children}
      <footer className="px-6 pb-6 pt-10 text-center text-[11px] text-el-muted">
        Powered by Visionspeaks Multimedia Ltd
      </footer>
    </div>
  );
}
