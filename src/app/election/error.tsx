"use client";

import { RefreshCw } from "lucide-react";

/** Shown when an election page fails to load (e.g. the database is unreachable). */
export default function ElectionError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="el-root grid place-items-center px-6">
      <div className="max-w-sm text-center">
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-el-muted">
          We couldn&apos;t load this page. This is usually a connection problem. Your data is safe, so try again in a moment.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-el-ink px-4 text-sm font-semibold text-white"
          >
            <RefreshCw className="size-4" /> Try again
          </button>
          <a href="/election" className="inline-flex h-10 items-center rounded-lg border border-el-border px-4 text-sm font-semibold">
            Back to sign in
          </a>
        </div>
      </div>
    </div>
  );
}
