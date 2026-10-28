type Upload = { visibility: string; ownerId: string };
type Viewer = { id: string; role: string } | null | undefined;

export function canReadPlanMedia(plan: { userId: string | null; active: boolean } | null | undefined, viewer: Viewer) {
  return !!plan && !!viewer?.id && (viewer.role === "COACH" || (viewer.role === "CLIENT" && plan.active && plan.userId === viewer.id));
}

export function canReadUpload(file: Upload, viewer: Viewer, assignedToViewer = false) {
  if (file.visibility === "PUBLIC") return true;
  return !!viewer?.id && (viewer.id === file.ownerId || viewer.role === "COACH" || (viewer.role === "CLIENT" && assignedToViewer));
}
