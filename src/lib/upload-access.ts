type Upload = { visibility: string; ownerId: string };
type Viewer = { id: string; role: string } | null | undefined;

export function canReadUpload(file: Upload, viewer: Viewer) {
  if (file.visibility === "PUBLIC") return true;
  return !!viewer?.id && (viewer.id === file.ownerId || viewer.role === "COACH");
}
