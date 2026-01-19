import { env } from "../config/env";

function parseHHMM(value: string, fallback: number) {
  const m = /^(\d{1,2}):(\d{2})$/.exec((value ?? "").trim());
  if (!m) return fallback;

  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return fallback;
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return fallback;

  return hh * 60 + mm;
}

function getLocalPartsInTZ(tz: string) {
  const parts = new Intl.DateTimeFormat("es-MX", {
    timeZone: tz,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const weekdayRaw = (parts.find(p => p.type === "weekday")?.value ?? "").toLowerCase();
  const hour = parseInt(parts.find(p => p.type === "hour")?.value ?? "0", 10);
  const minute = parseInt(parts.find(p => p.type === "minute")?.value ?? "0", 10);

  return { weekdayRaw, mins: hour * 60 + minute };
}

export function isWithinBusinessHours() {
  const tz = env.BUSINESS_TZ || "America/Monterrey";

  const start = parseHHMM(env.BUSINESS_START, 9 * 60);
  const end = parseHHMM(env.BUSINESS_END, 16 * 60);

  // Días permitidos por número: 0=Dom,1=Lun,...6=Sab
  const allowedDays = new Set(
    (env.BUSINESS_DAYS || "1,2,3,4,5")
      .split(",")
      .map(s => parseInt(s.trim(), 10))
      .filter(n => Number.isFinite(n) && n >= 0 && n <= 6)
  );

  const { weekdayRaw, mins } = getLocalPartsInTZ(tz);

  // Convertimos weekday string a número (más estable que comparar “mié/mie”)
  // Mapa básico para es-MX
  const weekdayMap: Record<string, number> = {
    dom: 0,
    lun: 1,
    mar: 2,
    mié: 3,
    mie: 3,
    jue: 4,
    vie: 5,
    sáb: 6,
    sab: 6,
  };

  const dayNum =
    weekdayMap[Object.keys(weekdayMap).find(k => weekdayRaw.startsWith(k)) ?? ""] ??
    -1;

  const inDays = allowedDays.size ? allowedDays.has(dayNum) : true;

  // Si quieres que sea “rango nocturno” (ej 22:00–06:00), también funciona:
  const inTime =
    start <= end ? mins >= start && mins <= end : mins >= start || mins <= end;

  return inDays && inTime;
}
