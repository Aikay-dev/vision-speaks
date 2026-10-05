/**
 * Result-sheet consistency checks. Client-safe: the agent form shows these as
 * warnings before submit, and the server recomputes them on save.
 * A flag never blocks a submission — it routes the sheet to admin review.
 */

export type SheetFigures = {
  votes: number[];
  registeredVoters: number;
  accreditedVoters: number;
  rejectedVotes: number;
  imageCount: number;
};

export type FlagCode =
  | "over_accredited"
  | "over_registered"
  | "outlier_turnout"
  | "no_image"
  | "zero_votes";

export const FLAG_LABELS: Record<FlagCode, string> = {
  over_accredited: "More votes cast than accredited voters",
  over_registered: "More accredited voters than registered voters",
  outlier_turnout: "Turnout above 95%",
  no_image: "No result-sheet photo",
  zero_votes: "No votes recorded",
};

export function computeTotals(f: Pick<SheetFigures, "votes" | "rejectedVotes">) {
  const totalValidVotes = f.votes.reduce((a, b) => a + (Number(b) || 0), 0);
  return { totalValidVotes, totalVotesCast: totalValidVotes + (Number(f.rejectedVotes) || 0) };
}

export function computeFlags(f: SheetFigures): FlagCode[] {
  const { totalValidVotes, totalVotesCast } = computeTotals(f);
  const flags: FlagCode[] = [];
  if (f.accreditedVoters > 0 && totalVotesCast > f.accreditedVoters) flags.push("over_accredited");
  if (f.registeredVoters > 0 && f.accreditedVoters > f.registeredVoters) flags.push("over_registered");
  if (f.registeredVoters > 0 && f.accreditedVoters / f.registeredVoters > 0.95) flags.push("outlier_turnout");
  if (f.imageCount === 0) flags.push("no_image");
  if (totalValidVotes === 0) flags.push("zero_votes");
  return flags;
}

/** Plain-language explanation for one flag, with the actual numbers. */
export function explainFlag(code: FlagCode, f: SheetFigures): string {
  const { totalVotesCast } = computeTotals(f);
  switch (code) {
    case "over_accredited":
      return `Total votes cast (${totalVotesCast.toLocaleString()}) is higher than accredited voters (${f.accreditedVoters.toLocaleString()}).`;
    case "over_registered":
      return `Accredited voters (${f.accreditedVoters.toLocaleString()}) is higher than registered voters (${f.registeredVoters.toLocaleString()}).`;
    case "outlier_turnout":
      return `Turnout is ${Math.round((f.accreditedVoters / f.registeredVoters) * 100)}% of registered voters, which is unusually high.`;
    case "no_image":
      return "No photo of the result sheet was attached.";
    case "zero_votes":
      return "Every party has 0 votes.";
  }
}
