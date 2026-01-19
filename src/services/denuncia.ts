import { env } from "../config/env";
import { postJson } from "./http";

export async function enviarDenuncia(payload: any) {
  // Si tu API requiere auth, pásalo como 3er param:
  // return postJson(env.DENUNCIA_API_URL, payload, "TU_TOKEN");
  return postJson(env.DENUNCIA_API_URL, payload);
}
