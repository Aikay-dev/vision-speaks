/** Client-safe constants shared by server and browser code. */

export const ELECTION_TYPE_LABELS: Record<string, string> = {
  presidential: "Presidential",
  governorship: "Governorship",
  senate: "Senate",
  reps: "House of Representatives",
  house_of_assembly: "State House of Assembly",
  lga_chairman: "LGA Chairmanship",
  councillor: "Councillorship",
  other: "Other",
};

export const STATUS_LABELS: Record<string, string> = {
  setup: "Setup",
  live: "Live",
  closed: "Closed",
  submitted: "Unverified",
  flagged: "Flagged",
  verified: "Verified",
};

export type SeedParty = { code: string; name: string; color: string; logo: string };

/**
 * INEC-registered parties (inecnigeria.org/parties, Oct 2026). Colours are
 * chosen to stay distinguishable on charts; admins can change them per election.
 */
export const INEC_PARTIES: SeedParty[] = [
  { code: "A", name: "Accord", color: "#1D4ED8", logo: "" },
  { code: "AA", name: "Action Alliance", color: "#4F46E5", logo: "/election/parties/aa.jpg" },
  { code: "AAC", name: "African Action Congress", color: "#B91C1C", logo: "/election/parties/aac.jpg" },
  { code: "ADC", name: "African Democratic Congress", color: "#EA580C", logo: "/election/parties/adc.jpg" },
  { code: "ADP", name: "Action Democratic Party", color: "#0F766E", logo: "/election/parties/adp.png" },
  { code: "APC", name: "All Progressives Congress", color: "#2563EB", logo: "/election/parties/apc.jpg" },
  { code: "APGA", name: "All Progressives Grand Alliance", color: "#CA8A04", logo: "/election/parties/apga.jpg" },
  { code: "APM", name: "Allied Peoples Movement", color: "#475569", logo: "/election/parties/apm.jpg" },
  { code: "APP", name: "Action Peoples Party", color: "#9333EA", logo: "/election/parties/app.png" },
  { code: "BP", name: "Boot Party", color: "#A16207", logo: "/election/parties/bp.jpg" },
  { code: "DLA", name: "Democratic Leadership Alliance", color: "#0369A1", logo: "/election/parties/dla.jpg" },
  { code: "LP", name: "Labour Party", color: "#16A34A", logo: "/election/parties/lp.jpg" },
  { code: "NDC", name: "Nigeria Democratic Congress", color: "#0891B2", logo: "/election/parties/ndc.jpeg" },
  { code: "NDP", name: "National Democratic Party", color: "#BE185D", logo: "/election/parties/ndp.jpg" },
  { code: "NNPP", name: "New Nigeria Peoples Party", color: "#7C3AED", logo: "/election/parties/nnpp.jpg" },
  { code: "NRM", name: "National Rescue Movement", color: "#15803D", logo: "/election/parties/nrm.png" },
  { code: "PDP", name: "Peoples Democratic Party", color: "#DC2626", logo: "/election/parties/pdp.jpg" },
  { code: "PRP", name: "Peoples Redemption Party", color: "#C2410C", logo: "/election/parties/prp.png" },
  { code: "SDP", name: "Social Democratic Party", color: "#DB2777", logo: "/election/parties/sdp.png" },
  { code: "YP", name: "Youth Party", color: "#6D28D9", logo: "/election/parties/yp.png" },
  { code: "YPP", name: "Young Progressives Party", color: "#65A30D", logo: "/election/parties/ypp.jpeg" },
  { code: "ZLP", name: "Zenith Labour Party", color: "#047857", logo: "/election/parties/zlp.jpg" },
];
