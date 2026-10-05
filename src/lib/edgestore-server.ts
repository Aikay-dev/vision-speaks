import "server-only";
import { initEdgeStore } from "@edgestore/server";
import {
  type CreateContextOptions,
  createEdgeStoreNextHandler,
} from "@edgestore/server/adapters/next/app";
import { z } from "zod";
import { SESSION_COOKIE, verifySession } from "./election/session-core";

type Context = { tenantId: string; role: string; userId: string; electionId: string };

async function createContext({ req }: CreateContextOptions): Promise<Context> {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  return {
    tenantId: session?.tenantId ?? "",
    role: session?.role ?? "anonymous",
    userId: session?.sub ?? "",
    electionId: session?.electionId ?? "",
  };
}

const es = initEdgeStore.context<Context>().create();

export const router = es.router({
  resultSheets: es
    .imageBucket({ maxSize: 1024 * 1024 * 8 })
    .input(z.object({ electionId: z.string(), pollingUnitId: z.string() }))
    // /resultSheets/{tenant}/{election}/{pu}/...
    .path(({ ctx, input }) => [
      { tenant: ctx.tenantId },
      { election: input.electionId },
      { pu: input.pollingUnitId },
    ])
    .metadata(({ ctx }) => ({ uploadedBy: ctx.userId, role: ctx.role }))
    .beforeUpload(({ ctx, input }) => {
      if (!ctx.tenantId) return false;
      // Agents can only upload into their own election; the submit action
      // re-checks the polling unit before the file is confirmed.
      if (ctx.role === "agent") return ctx.electionId === input.electionId;
      return ctx.role === "admin";
    }),
});

export const handler = createEdgeStoreNextHandler({ router, createContext });

// Lazy: reading router.client initialises the provider, which needs the EdgeStore
// keys. Doing it at import time would break builds that don't have them set.
export function getBackendClient() {
  return router.client;
}

export type EdgeStoreRouter = typeof router;
