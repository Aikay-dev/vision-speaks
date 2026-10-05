"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { createElection } from "@/app/election/admin/actions";
import { ELECTION_TYPE_LABELS, INEC_PARTIES } from "@/lib/election/constants";
import LgaPicker, { type LgaPick } from "./LgaPicker";
import PartyEditor, { type PartyRow } from "./PartyEditor";
import { Button, Card, cx, Field, Input, Select, Textarea } from "./ui";

const STEPS = ["Name", "Type & date", "Coverage", "Parties"];

export default function NewElectionWizard({ ownPartyCode }: { ownPartyCode: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("governorship");
  const [date, setDate] = useState("");
  const [lgas, setLgas] = useState<LgaPick[]>([]);
  const own = INEC_PARTIES.find((p) => p.code === ownPartyCode);
  const [parties, setParties] = useState<PartyRow[]>(own ? [{ ...own, candidateName: "" }] : []);

  const canNext = [name.trim().length >= 3, Boolean(type), lgas.length > 0, parties.length >= 2][step];

  function submit() {
    setError("");
    start(async () => {
      const res = await createElection({ name, description, type: type as never, date: date || undefined, lgas, parties });
      if (!res.ok) return setError(res.error);
      router.push(`/election/admin/${res.id}/setup?tab=locations&welcome=1`);
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <ol className="mb-6 grid grid-cols-4 gap-2">
        {STEPS.map((s, i) => (
          <li key={s} className="space-y-2">
            <div className={cx("h-1 rounded-full", i <= step ? "bg-el-brand" : "bg-el-border")} />
            <p className={cx("text-xs font-medium", i === step ? "text-el-text" : "text-el-muted")}>
              <span className="num">{i + 1}.</span> {s}
            </p>
          </li>
        ))}
      </ol>

      <Card>
        <div className="space-y-5 p-5 sm:p-7">
          {step === 0 && (
            <>
              <div>
                <h2 className="text-lg font-bold">What are you monitoring?</h2>
                <p className="mt-1 text-sm text-el-muted">Give it a name your team will recognise. You can change it later.</p>
              </div>
              <Field label="Name">
                <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Anambra Governorship 2026" className="h-12 text-base" />
              </Field>
              <Field label="Notes (optional)">
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Anything your team should know" />
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-lg font-bold">Election type and date</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Type">
                  <Select value={type} onChange={(e) => setType(e.target.value)}>
                    {Object.entries(ELECTION_TYPE_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Election date (optional)">
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </Field>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <h2 className="text-lg font-bold">Which LGAs are you covering?</h2>
                <p className="mt-1 text-sm text-el-muted">
                  Pick a state, then tick its LGAs. You can add more states and LGAs later. Wards and polling units come next.
                </p>
              </div>
              <LgaPicker value={lgas} onChange={setLgas} />
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <h2 className="text-lg font-bold">Parties on the ballot</h2>
                <p className="mt-1 text-sm text-el-muted">
                  Agents will see these parties in this order, so match the result sheet. Colours are used in the charts.
                </p>
              </div>
              <PartyEditor value={parties} onChange={setParties} />
            </>
          )}

          {error && <p role="alert" className="rounded-lg bg-el-danger/5 px-3 py-2 text-sm text-el-danger">{error}</p>}
        </div>

        <footer className="flex items-center justify-between border-t border-el-border px-5 py-4 sm:px-7">
          <Button variant="ghost" onClick={() => (step === 0 ? router.push("/election/admin") : setStep(step - 1))}>
            <ArrowLeft className="size-4" /> {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext}>
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={!canNext || pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Create election monitoring
            </Button>
          )}
        </footer>
      </Card>
    </div>
  );
}
