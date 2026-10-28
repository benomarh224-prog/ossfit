import { z } from "zod";

export const accountChangeSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  currentPassword: z.string().min(1).max(256),
  newPassword: z.string().min(12).max(72).refine(
    (value) => new TextEncoder().encode(value).length <= 72,
    "Password must fit within 72 UTF-8 bytes",
  ).optional(),
});

// Sessions issued before versioning was added belong to version zero only.
export function isSessionCurrent(tokenVersion: number | undefined, storedVersion: number): boolean {
  return (tokenVersion ?? 0) === storedVersion;
}
