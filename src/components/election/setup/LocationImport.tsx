"use client";

import Papa from "papaparse";
import { useState, useTransition } from "react";
import { Download, FileUp, Loader2 } from "lucide-react";
import { importLocations } from "@/app/election/admin/actions";
import { Button, Card, fmt } from "../ui";

const COLUMNS = ["state", "lga", "ward", "ward_code", "pu_code", "pu_name", "registered_voters"];
const TEMPLATE =
  COLUMNS.join(",") +
  "\nAnambra,Idemili North,Ogidi I,01,24/09/01/001,Ogidi Town Hall,812\nAnambra,Idemili North,Ogidi I,01,24/09/01/002,Umuru Primary School,645\n";

type Result = { created: { lgas: number; wards: number; pus: number }; skipped: number; errors: string[] };

export default function LocationImport({ electionId, onDone }: { electionId: string; onDone: () => void }) {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function onFile(file: File) {
    setResult(null);
    setError("");
    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
      complete: (res) => {
        const missing = ["state", "lga", "ward", "pu_name"].filter((c) => !res.meta.fields?.includes(c));
        if (missing.length) {
          setRows([]);
          setParseError(`Missing column(s): ${missing.join(", ")}`);
          return;
        }
        setParseError("");
        setRows(res.data);
      },
    });
  }

  return (
    <Card title="Import wards and polling units">
      <div className="space-y-4 p-5 text-sm">
        <p className="text-el-muted">
          One row per polling unit. LGAs and wards that don&apos;t exist yet are created automatically. Polling units already
          in the same ward (same code, or same name when there&apos;s no code) are skipped, so it&apos;s safe to re-import.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-el-border bg-el-surface px-4 py-2 font-medium hover:bg-el-surface-2">
            <FileUp className="size-4" />
            {fileName || "Choose CSV file"}
            <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          </label>
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(TEMPLATE)}`}
            download="polling-units-template.csv"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-el-brand hover:underline"
          >
            <Download className="size-3.5" /> Download template
          </a>
        </div>
        <p className="text-xs text-el-muted">
          Columns: <code className="rounded bg-el-surface-2 px-1">{COLUMNS.join(", ")}</code>. ward_code, pu_code and
          registered_voters are optional.
        </p>

        {parseError && <p className="text-el-danger">{parseError}</p>}

        {rows.length > 0 && !result && (
          <>
            <div className="overflow-x-auto rounded-lg border border-el-border">
              <table className="w-full text-xs">
                <thead className="bg-el-surface-2 text-left text-el-muted">
                  <tr>{COLUMNS.map((c) => <th key={c} className="px-2 py-1.5 font-medium">{c}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-el-border">
                  {rows.slice(0, 5).map((r, i) => (
                    <tr key={i}>{COLUMNS.map((c) => <td key={c} className="whitespace-nowrap px-2 py-1.5">{r[c]}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const res = await importLocations(electionId, rows);
                  if (!res.ok) return setError(res.error);
                  setResult(res);
                })
              }
            >
              {pending && <Loader2 className="size-4 animate-spin" />} Import {fmt(rows.length)} rows
            </Button>
          </>
        )}

        {error && <p className="text-el-danger">{error}</p>}

        {result && (
          <div className="space-y-2 rounded-lg border border-el-border bg-el-surface-2 p-4">
            <p className="font-semibold">
              Created {fmt(result.created.pus)} polling units, {fmt(result.created.wards)} wards and {fmt(result.created.lgas)} LGAs.
              {result.skipped > 0 && ` Skipped ${fmt(result.skipped)} that already existed.`}
            </p>
            {result.errors.length > 0 && (
              <ul className="list-inside list-disc text-xs text-el-danger">
                {result.errors.map((e) => <li key={e}>{e}</li>)}
              </ul>
            )}
            <Button size="sm" variant="secondary" onClick={onDone}>Done</Button>
          </div>
        )}
      </div>
    </Card>
  );
}
