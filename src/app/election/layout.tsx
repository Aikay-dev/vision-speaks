import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: { default: "Election Monitoring Portal", template: "%s · Election Monitoring" },
  description: "Polling-unit result collation and monitoring by Visionspeaks.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0b1220",
};

export default function ElectionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
