export const env = {
  PORT: Number(process.env.PORT ?? 3080),

  // Base URL pública o interna donde vive ESTE bot (para llamarse a sí mismo /v1/blacklist)
  BOT_BASE_URL: process.env.BOT_BASE_URL ?? "http://localhost:3080",

  // Endpoints externos (tu API real)
  DENUNCIA_API_URL:
    process.env.DENUNCIA_API_URL ?? "https://tu-api.com/denuncias",
  AGENTE_NOTIFY_URL:
    process.env.AGENTE_NOTIFY_URL ?? "https://tu-api.com/notificar-agente",

  ALLOWED_NUMBER: process.env.ALLOWED_NUMBER ?? "",

  // Token para tus endpoints internos del bot
  API_TOKEN:
    process.env.API_TOKEN ??
    "bRGHEnYqkpeGwXXJAH2LHxYVQikttottwCfBGHVQ9ksrxJEVdN2mJgHYvqCpf9EGizpUpGgDA9vBffuYJXzvgEU7TthRnZPmTNZn",

  BUSINESS_TZ: process.env.BUSINESS_TZ ?? "America/Monterrey",
  BUSINESS_DAYS: process.env.BUSINESS_DAYS ?? "1,2,3,4,5",
  BUSINESS_START: process.env.BUSINESS_START ?? "09:00",
  BUSINESS_END: process.env.BUSINESS_END ?? "16:00",
  AGENT_NUMBERS: process.env.AGENT_NUMBERS ?? "",

};
