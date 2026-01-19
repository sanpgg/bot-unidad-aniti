import { env } from "../config/env";

function parseNumbers(raw: string): string[] {
  return raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export async function sendMessageToAgents(payload: { message: string; urlMedia?: string | null }) {
  const numbers = parseNumbers(env.AGENT_NUMBERS);

  if (numbers.length === 0) {
    throw new Error("AGENT_NUMBERS is empty. Configure it in .env");
  }

  const baseUrl = env.BOT_BASE_URL.replace(/\/$/, "");
  const url = `${baseUrl}/v1/messages`;

  // Node 20 ya trae fetch global ✅
  const results = await Promise.allSettled(
    numbers.map(async (number) => {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.API_TOKEN}`,
        },
        body: JSON.stringify({
          number,
          message: payload.message,
          urlMedia: payload.urlMedia ?? null,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Failed to send to ${number}. HTTP ${res.status}. ${txt}`);
      }

      return number;
    })
  );

  const ok = results
    .filter((r) => r.status === "fulfilled")
    .map((r: any) => r.value);

  const fail = results
    .filter((r) => r.status === "rejected")
    .map((r: any) => r.reason?.message ?? String(r.reason));

  return { ok, fail };
}
