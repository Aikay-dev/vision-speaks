import "server-only";
import mongoose, { Schema, type Model, type Types } from "mongoose";

/**
 * Every collection carries tenantId. Queries must always filter by the
 * session's tenantId — see scoped.ts.
 */

export const ELECTION_TYPES = [
  "presidential",
  "governorship",
  "senate",
  "reps",
  "house_of_assembly",
  "lga_chairman",
  "councillor",
  "other",
] as const;

export const ELECTION_STATUSES = ["setup", "live", "closed"] as const;
export const SUBMISSION_STATUSES = ["submitted", "flagged", "verified"] as const;

const electionSchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ELECTION_TYPES, required: true },
    date: { type: Date },
    description: { type: String, default: "" },
    status: { type: String, enum: ELECTION_STATUSES, default: "setup" },
    states: { type: [String], default: [] },
  },
  { timestamps: true },
);

const partySchema = new Schema(
  {
    tenantId: { type: String, required: true },
    electionId: { type: Schema.Types.ObjectId, required: true },
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    candidateName: { type: String, default: "" },
    color: { type: String, required: true },
    logo: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);
partySchema.index({ tenantId: 1, electionId: 1, code: 1 }, { unique: true });

const locationSchema = new Schema(
  {
    tenantId: { type: String, required: true },
    electionId: { type: Schema.Types.ObjectId, required: true },
    level: { type: String, enum: ["lga", "ward", "pu"], required: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, default: "", trim: true },
    state: { type: String, required: true },
    lgaId: { type: Schema.Types.ObjectId },
    wardId: { type: Schema.Types.ObjectId },
    registeredVoters: { type: Number, default: 0 },
  },
  { timestamps: true },
);
locationSchema.index({ tenantId: 1, electionId: 1, level: 1, lgaId: 1, wardId: 1 });

const agentSchema = new Schema(
  {
    tenantId: { type: String, required: true },
    electionId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: "", trim: true },
    username: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    pollingUnitId: { type: Schema.Types.ObjectId, required: true },
    wardId: { type: Schema.Types.ObjectId, required: true },
    lgaId: { type: Schema.Types.ObjectId, required: true },
    active: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);
agentSchema.index({ username: 1 }, { unique: true });
// One agent per polling unit.
agentSchema.index({ pollingUnitId: 1 }, { unique: true });
agentSchema.index({ tenantId: 1, electionId: 1 });

const historySchema = new Schema(
  {
    at: { type: Date, default: Date.now },
    by: { role: String, id: String, name: String },
    action: { type: String, required: true },
    changes: [{ _id: false, field: String, from: Schema.Types.Mixed, to: Schema.Types.Mixed }],
    reason: { type: String, default: "" },
    clientSubmissionId: { type: String },
  },
  { _id: false },
);

const submissionSchema = new Schema(
  {
    tenantId: { type: String, required: true },
    electionId: { type: Schema.Types.ObjectId, required: true },
    pollingUnitId: { type: Schema.Types.ObjectId, required: true },
    wardId: { type: Schema.Types.ObjectId, required: true },
    lgaId: { type: Schema.Types.ObjectId, required: true },
    agentId: { type: Schema.Types.ObjectId, required: true },
    scores: [
      {
        _id: false,
        partyId: { type: Schema.Types.ObjectId, required: true },
        votes: { type: Number, required: true, min: 0 },
      },
    ],
    registeredVoters: { type: Number, default: 0 },
    accreditedVoters: { type: Number, default: 0 },
    rejectedVotes: { type: Number, default: 0 },
    totalValidVotes: { type: Number, default: 0 },
    totalVotesCast: { type: Number, default: 0 },
    images: [{ _id: false, url: String, thumbnailUrl: String, size: Number }],
    comment: { type: String, default: "" },
    geo: { lat: Number, lng: Number, accuracy: Number },
    status: { type: String, enum: SUBMISSION_STATUSES, default: "submitted" },
    flags: { type: [String], default: [] },
    history: { type: [historySchema], default: [] },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);
submissionSchema.index({ tenantId: 1, electionId: 1, pollingUnitId: 1 }, { unique: true });
submissionSchema.index({ tenantId: 1, electionId: 1, status: 1, updatedAt: -1 });

type Id = Types.ObjectId;
type Stamps = { createdAt: Date; updatedAt: Date };

export type ElectionDoc = Stamps & {
  _id: Id;
  tenantId: string;
  name: string;
  type: (typeof ELECTION_TYPES)[number];
  date?: Date | null;
  description: string;
  status: (typeof ELECTION_STATUSES)[number];
  states: string[];
};

export type PartyDoc = Stamps & {
  _id: Id;
  tenantId: string;
  electionId: Id;
  code: string;
  name: string;
  candidateName: string;
  color: string;
  logo: string;
  order: number;
};

export type LocationDoc = Stamps & {
  _id: Id;
  tenantId: string;
  electionId: Id;
  level: "lga" | "ward" | "pu";
  name: string;
  code: string;
  state: string;
  lgaId?: Id;
  wardId?: Id;
  registeredVoters: number;
};

export type AgentDoc = Stamps & {
  _id: Id;
  tenantId: string;
  electionId: Id;
  name: string;
  phone: string;
  username: string;
  passwordHash: string;
  pollingUnitId: Id;
  wardId: Id;
  lgaId: Id;
  active: boolean;
  lastLoginAt?: Date;
};

export type HistoryEntry = {
  at: Date;
  by: { role: string; id: string; name: string };
  action: string;
  changes: { field: string; from: unknown; to: unknown }[];
  reason: string;
  clientSubmissionId?: string;
};

export type SubmissionDoc = Stamps & {
  _id: Id;
  tenantId: string;
  electionId: Id;
  pollingUnitId: Id;
  wardId: Id;
  lgaId: Id;
  agentId: Id;
  scores: { partyId: Id; votes: number }[];
  registeredVoters: number;
  accreditedVoters: number;
  rejectedVotes: number;
  totalValidVotes: number;
  totalVotesCast: number;
  images: { url: string; thumbnailUrl?: string; size?: number }[];
  comment: string;
  geo?: { lat?: number; lng?: number; accuracy?: number };
  status: (typeof SUBMISSION_STATUSES)[number];
  flags: string[];
  history: HistoryEntry[];
  submittedAt: Date;
};

function model<T>(name: string, schema: Schema): Model<T> {
  return (mongoose.models[name] as Model<T>) || (mongoose.model(name, schema) as unknown as Model<T>);
}

export const Election = model<ElectionDoc>("Election", electionSchema);
export const Party = model<PartyDoc>("Party", partySchema);
export const Location = model<LocationDoc>("Location", locationSchema);
export const Agent = model<AgentDoc>("Agent", agentSchema);
export const Submission = model<SubmissionDoc>("Submission", submissionSchema);
