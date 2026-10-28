import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireCoach } from "@/lib/server-utils";
import { allowRequest } from "@/lib/rate-limit";
import { mediaRegistrationSchema, mediaUploadSchema, mediaSizeLimit, validMediaPath } from "@/lib/media-policy";
import { findMediaPlan, registerPlanMedia } from "@/lib/plan-media-server";
import { z } from "zod";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as HandleUploadBody | null;
  if (!body || !["blob.generate-client-token", "blob.upload-completed"].includes(body.type)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (body.type === "blob.generate-client-token" && !await requireCoach()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let callbackVerified = false;
  try {
    const result = await handleUpload({ request: req, body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const session = await requireCoach();
        if (!session) throw new Error("Unauthorized");
        if (!await allowRequest("coaching-media", session.user.id, 30, 86400000)) throw new Error("Daily media upload limit reached");
        const data = mediaUploadSchema.parse(JSON.parse(clientPayload ?? "null"));
        if (!validMediaPath(pathname, data.kind, data.planId, session.user.id, data.contentType)) throw new Error("Invalid path");
        if (!(await findMediaPlan(data.kind, data.planId))?.userId) throw new Error("Assign this plan to a trainee first");
        return { allowedContentTypes: [data.contentType], maximumSizeInBytes: mediaSizeLimit(data.contentType),
          validUntil: Date.now() + 15 * 60 * 1000, addRandomSuffix: false, allowOverwrite: false,
          tokenPayload: JSON.stringify({ ...data, pathname, ownerId: session.user.id }),
        };
      },
      // handleUpload verifies the Blob callback signature before this is called.
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        callbackVerified = true;
        const data = mediaRegistrationSchema.extend({ ownerId: z.string().min(1) }).parse(JSON.parse(tokenPayload ?? "null"));
        if (blob.pathname !== data.pathname) throw new Error("Path mismatch");
        await registerPlanMedia(data);
      },
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Upload rejected. Check your file, plan and daily upload limit." }, { status: callbackVerified ? 503 : 400 });
  }
}
