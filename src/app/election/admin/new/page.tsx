import Link from "next/link";
import { requireAdmin } from "@/lib/election/session";
import NewElectionWizard from "@/components/election/NewElectionWizard";

export const metadata = { title: "New Election Monitoring" };

export default async function NewElectionPage() {
  const { tenant } = await requireAdmin();
  return (
    <main className="px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto mb-6 max-w-3xl">
        <Link href="/election/admin" className="text-sm text-el-muted hover:text-el-text">← My Election Monitorings</Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">New Election Monitoring</h1>
      </div>
      <NewElectionWizard ownPartyCode={tenant.shortName} />
    </main>
  );
}
