import { z } from "zod";

export const MEDIA_TYPES: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
  "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov",
};
export type PlanKind = "workout" | "nutrition";
const identifier = z.string().min(1).max(128).regex(/^[a-zA-Z0-9_-]+$/);
export const planTargetSchema = z.object({ kind: z.enum(["workout", "nutrition"]), planId: identifier });
export const mediaUploadSchema = planTargetSchema.extend({
  name: z.string().trim().min(1).max(160),
  contentType: z.string().refine((value) => Object.hasOwn(MEDIA_TYPES, value)),
});
export const mediaRegistrationSchema = mediaUploadSchema.extend({ pathname: z.string().max(512) });

export function mediaSizeLimit(contentType: string): number {
  return Object.hasOwn(MEDIA_TYPES, contentType) ? (contentType.startsWith("video/") ? 100 : 10) * 1024 * 1024 : 0;
}

export function validMediaPath(pathname: string, kind: PlanKind, planId: string, ownerId: string, contentType: string): boolean {
  if (!Object.hasOwn(MEDIA_TYPES, contentType)) return false;
  const prefix = `coaching/${kind}/${planId}/${ownerId}/`;
  const extension = MEDIA_TYPES[contentType];
  if (!extension || !pathname.startsWith(prefix)) return false;
  return new RegExp(`^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\\.${extension}$`).test(pathname.slice(prefix.length));
}

export function hasMediaSignature(bytes: Uint8Array, contentType: string): boolean {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (contentType === "image/jpeg") return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (contentType === "image/png") return bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10";
  if (contentType === "image/webp") return ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
  if (contentType === "video/webm") return bytes.slice(0, 4).join(",") === "26,69,223,163";
  if (contentType === "video/mp4") return ascii(4, 8) === "ftyp";
  if (contentType === "video/quicktime") return ["ftyp", "moov", "mdat", "wide"].includes(ascii(4, 8));
  return false;
}

export function parseByteRange(value: string | null, size: number): { start: number; end: number } | null | false {
  if (!value) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(value);
  if (!match || (!match[1] && !match[2])) return false;
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start > end || start >= size) return false;
  return { start, end };
}
