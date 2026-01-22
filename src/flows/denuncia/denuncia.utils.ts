export const normalizeChoice = (input: string) => (input ?? "").trim().toLowerCase();

// Ajusta esto según tu provider (Sherpa)
export function extractMedia(ctx: any) {
  const m = ctx?.message || ctx?.msg || null;

  if (m?.imageMessage) return { kind: "image" };
  if (m?.videoMessage) return { kind: "video" };
  if (m?.documentMessage) return { kind: "document" };
  if (ctx?.hasMedia) return { kind: "media" };

  return null;
}
