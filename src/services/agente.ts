import { env } from "../config/env";
import { postJson } from "./http";

export async function notificarAgente(payload: any) {
  // Si tu API requiere auth, pásalo como 3er param
  return postJson(env.AGENTE_NOTIFY_URL, payload);
}
