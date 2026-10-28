import { db } from "@/lib/db";
import { get, head } from "@vercel/blob";
import { hasMediaSignature, mediaSizeLimit, validMediaPath, type PlanKind } from "@/lib/media-policy";

export async function findMediaPlan(kind: PlanKind, planId: string) {
  return kind === "workout" ? db.workoutPlan.findUnique({ where: { id: planId } }) : db.nutritionPlan.findUnique({ where: { id: planId } });
}

export async function registerPlanMedia(data: { kind: PlanKind; planId: string; ownerId: string; pathname: string; name: string; contentType: string }) {
  if (!validMediaPath(data.pathname, data.kind, data.planId, data.ownerId, data.contentType)) throw new Error("Invalid media path");
  const plan = await findMediaPlan(data.kind, data.planId);
  if (!plan?.userId) throw new Error("Assign this plan to a trainee first");
  const existing = await db.uploadedFile.findUnique({ where: { pathname: data.pathname }, include: { planMedia: true } });
  if (existing?.planMedia) return existing.planMedia;
  const blob = await head(data.pathname);
  if (blob.contentType !== data.contentType || !blob.size || blob.size > mediaSizeLimit(data.contentType)) throw new Error("Invalid file type or size");
  const sample = await get(data.pathname, { access: "private", headers: { Range: "bytes=0-63" } });
  if (!sample || sample.statusCode !== 200) throw new Error("File unavailable");
  const reader = sample.stream.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (length < 16) {
      const { value, done } = await reader.read();
      if (done) break;
      chunks.push(value); length += value.length;
    }
  } finally { await reader.cancel(); }
  const signature = Buffer.concat(chunks).subarray(0, 16);
  if (!hasMediaSignature(signature, data.contentType)) throw new Error("This file does not match its media format");
  try { return await db.$transaction(async (tx) => {
    const upload = await tx.uploadedFile.upsert({
      where: { pathname: data.pathname }, update: {},
      create: { ownerId: data.ownerId, pathname: data.pathname, contentType: blob.contentType, size: blob.size, visibility: "PRIVATE" },
    });
    return tx.planMedia.upsert({ where: { uploadId: upload.id }, update: {}, create: {
      uploadId: upload.id, name: data.name,
      ...(data.kind === "workout" ? { workoutPlanId: data.planId } : { nutritionPlanId: data.planId }),
    } });
  }); } catch (error) {
    // The signed callback and the browser's completion request may finish together.
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      const saved = await db.planMedia.findFirst({ where: { upload: { pathname: data.pathname } } });
      if (saved) return saved;
    }
    throw error;
  }
}
