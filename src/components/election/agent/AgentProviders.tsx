"use client";

import { EdgeStoreProvider } from "@/lib/edgestore";

export default function AgentProviders({ children }: { children: React.ReactNode }) {
  return <EdgeStoreProvider>{children}</EdgeStoreProvider>;
}
