import { env } from "../config/env";

export function isAllowedNumber(from: string) {
  console.log("Inicio isAllowedNumber")
  const allowed = (env.ALLOWED_NUMBER ?? "").trim();

  console.log("Numero:" + env.ALLOWED_NUMBER)

  console.log("Fin isAllowedNumber")
  if (!allowed) return true; // si no está configurado, no bloquea
  return from === allowed;
}
