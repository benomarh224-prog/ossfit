import { z } from "zod";

export const messageSchema = z.object({
  body: z.string().trim().min(1).max(4000),
  clientId: z.string().min(1).max(100).optional(),
}).strict();

export function conversationAccess(viewer: { id: string; role: string }, clientId?: string | null) {
  if (!viewer.id) return null;
  if (viewer.role === "CLIENT") return { clientId: viewer.id };
  if (viewer.role === "COACH" && clientId) return { clientId, coachId: viewer.id };
  return null;
}
