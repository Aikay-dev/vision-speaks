"use client";

import useSWR from "swr";
import type { LiveStats } from "@/lib/election/stats";

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 401) {
    window.location.href = "/election";
    throw new Error("Signed out");
  }
  if (!res.ok) throw new Error("Couldn't load live results");
  return (await res.json()) as LiveStats;
};

/** Live results for a scope. Polls every 10s while the tab is visible. */
export function useLive(electionId: string, opts: { lga?: string; ward?: string; verified?: boolean; refreshMs?: number } = {}) {
  const sp = new URLSearchParams();
  if (opts.lga) sp.set("lga", opts.lga);
  if (opts.ward) sp.set("ward", opts.ward);
  if (opts.verified) sp.set("verified", "1");
  return useSWR(`/api/election/${electionId}/live?${sp}`, fetcher, {
    refreshInterval: opts.refreshMs ?? 10_000,
    refreshWhenHidden: false,
    revalidateOnFocus: true,
    keepPreviousData: true,
  });
}
