export async function postJson(url: string, data: any, bearerToken?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (bearerToken) headers["Authorization"] = `Bearer ${bearerToken}`;

  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  const text = await resp.text().catch(() => "");
  if (!resp.ok) {
    throw new Error(`POST ${url} failed (${resp.status}): ${text}`);
  }
  return text;
}
