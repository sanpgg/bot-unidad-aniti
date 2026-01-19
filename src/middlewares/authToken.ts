import { env } from "../config/env";

export function authenticateToken(req: any, res: any, next: any) {
  const token = req.headers["authorization"];
  const expectedToken = `Bearer ${env.API_TOKEN}`;

  if (!token || token !== expectedToken) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Unauthorized" }));
  }
  next();
}
