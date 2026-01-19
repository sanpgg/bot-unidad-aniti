import { env } from "../config/env";
import { postJson } from "./http";

/**
 * Llama al endpoint de ESTE bot para agregar/quitar a blacklist.
 * Requiere que BOT_BASE_URL sea accesible desde donde corre el bot.
 */
export async function blacklistAdd(number: string) {
  return postJson(
    `${env.BOT_BASE_URL}/v1/blacklist`,
    { number, intent: "add" },
    env.API_TOKEN
  );
}

export async function blacklistRemove(number: string) {
  return postJson(
    `${env.BOT_BASE_URL}/v1/blacklist`,
    { number, intent: "remove" },
    env.API_TOKEN
  );
}
