"use client";

import Papa from "papaparse";
import { useState, useTransition } from "react";
import { Download, FileUp, Loader2, X } from "lucide-react";
import { importAgents } from "@/app/election/admin/actions";
import { Button, Card, fmt } from "../ui";
import type { Credentials } from "./CredentialsDialog";

const TEMPLATE = "name,phone,pu_code\nChinedu Okafor,08030000001,24/09/01/001\nAisha Bello,08030000002,24/09/01/002\n";

export default function AgentImport({
  electionId,
  onCreated,
  onClose,
}: {
  electionId: string;
  onCreated: (c: Credentials[]) => void;
  onClose: () => void;
}) {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, start] = useTransition();

  return (
    <Card title="Import agents from CSV" className="mb-5" action={<button onClick={onClose} aria-label="Close"><X className="size-4 text-el-muted" /></button>}>
      <div className="space-y-4 p-5 text-sm">
        <p className="text-el-muted">
          Columns: <code className="rounded bg-el-surface-2 px-1">name, phone, pu_code</code>. The polling-unit code must match
          one on the Setup page. Usernames and passwords are generated for you, and you can download them all as a CSV afterwards.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-el-border bg-el-surface px-4 py-2 font-medium hover:bg-el-surface-2">
            <FileUp className="size-4" />
            {fileName || "Choose CSV file"}
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setFileName(f.name);
                setErrors([]);
                Papa.parse<Record<string, string>>(f, {
                  header: true,
                  skipEmptyLines: true,
                  transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
                  complete: (r) => setRows(r.data),
                });
              }}
            />
          </label>
          <a href={`data:text/csv;charset=utf-8,${encodeURIComponent(TEMPLATE)}`} download="agents-template.csv" className="inline-flex items-center gap-1.5 text-xs font-semibold text-el-brand hover:underline">
            <Download className="size-3.5" /> Download template
          </a>
        </div>
        {rows.length > 0 && (
          <Button
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await importAgents(electionId, rows);
                if (!res.ok) return setErrors([res.error]);
                setErrors(res.errors);
                if (res.credentials.length) onCreated(res.credentials);
              })
            }
          >
            {pending && <Loader2 className="size-4 animate-spin" />} Create {fmt(rows.length)} agents
          </Button>
        )}
        {errors.length > 0 && (
          <ul className="list-inside list-disc space-y-0.5 text-xs text-el-danger">
            {errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
        )}
      </div>
    </Card>
  );
}
