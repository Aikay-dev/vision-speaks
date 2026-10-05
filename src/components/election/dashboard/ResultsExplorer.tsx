"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useLive } from "./useLive";
import { AreaTable, PartyStandings, StatTiles, UpdatedAgo } from "./parts";
import { Card } from "../ui";

/** Drill-down: election → LGA → ward → polling unit (the PU row opens the submission). */
export default function ResultsExplorer({ electionId }: { electionId: string }) {
  const sp = useSearchParams();
  const lga = sp.get("lga") ?? undefined;
  const ward = sp.get("ward") ?? undefined;
  const { data, error } = useLive(electionId, { lga, ward });
  const base = `/election/admin/${electionId}`;

  const crumbs = [
    { label: "All LGAs", href: `${base}/results` },
    ...(lga ? [{ label: data?.scope.lgaName ?? "LGA", href: `${base}/results?lga=${lga}` }] : []),
    ...(ward ? [{ label: data?.scope.wardName ?? "Ward", href: `${base}/results?lga=${lga}&ward=${ward}` }] : []),
  ];
  const childTitle = ward ? "Polling units" : lga ? "Wards" : "LGAs";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap items-center gap-1.5 text-sm" aria-label="Breadcrumb">
          {crumbs.map((c, i) => (
            <span key={c.href} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-el-muted">›</span>}
              {i === crumbs.length - 1 ? (
                <span className="font-semibold">{c.label}</span>
              ) : (
                <Link href={c.href} className="text-el-muted hover:text-el-text">{c.label}</Link>
              )}
            </span>
          ))}
        </nav>
        {data && <UpdatedAgo iso={data.updatedAt} error={Boolean(error)} />}
      </div>

      {!data ? (
        <div className="grid h-64 place-items-center text-el-muted">
          {error ? <p className="text-sm text-el-danger">{error.message}</p> : <Loader2 className="size-6 animate-spin" />}
        </div>
      ) : (
        <>
          <StatTiles data={data} />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <Card title="Party standings">
              <PartyStandings parties={data.parties} totalValid={data.summary.totalValidVotes} />
            </Card>
            <Card title={childTitle}>
              <AreaTable
                areas={data.areas}
                hrefFor={(a) =>
                  a.level === "lga"
                    ? `${base}/results?lga=${a.id}`
                    : a.level === "ward"
                      ? `${base}/results?lga=${lga}&ward=${a.id}`
                      : a.submissionId
                        ? `${base}/submissions/${a.submissionId}`
                        : null
                }
              />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
