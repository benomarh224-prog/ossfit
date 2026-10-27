// Client-safe helpers (no db / server-only imports).
export function buildWhatsappLink(number: string | undefined | null, message: string) {
  const n = number || "+212600000000";
  const clean = n.replace(/[^\d]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export async function apiFetch<T = any>(
  url: string,
  options?: RequestInit & { json?: any }
): Promise<T> {
  const init: RequestInit = { ...options };
  if (options?.json !== undefined) {
    init.headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    init.body = JSON.stringify(options.json);
    init.method = init.method || "POST";
  }
  const res = await fetch(url, init);
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg = data?.error || (typeof data === "string" ? data : "Request failed");
    throw new Error(msg);
  }
  return data as T;
}

export async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url as string;
}
