import { addKeyword, utils } from "@builderbot/bot";
import { Provider, Database } from "../bot";
import { isWithinBusinessHours } from "../utils/time";
import { blacklistAdd } from "../services/blacklist";
import { sendMessageToAgents } from "../services/broadcast";

export const agenteFlow = addKeyword<Provider, Database>(utils.setEvent("AGENTE_FLOW"))
  .addAction(async (ctx, { flowDynamic }) => {
    // 1) Bloquear al usuario para que el bot no mande más mensajes al ciudadano
    try {
      await blacklistAdd(ctx.from);
    } catch {
      // ignore
    }

    const dentro = isWithinBusinessHours();

    if (!dentro) {
      await flowDynamic(
        "👤 En este momento no hay un asesor disponible.\n\n" +
          "🕘 *Horario de atención:* Lunes a viernes de 8:00 a 16:00.\n\n" +
          "En cuanto esté disponible, un asesor se comunicará contigo."
      );
      return;
    }

    // 2) Notificar a TODOS los agentes
    try {
      const msg =
        "🔔 *Nuevo usuario en espera*\n\n" +
        `• Número: ${ctx.from}\n` +
        `• Nombre: ${ctx.pushName ?? "N/D"}\n` +
        `• Fecha: ${new Date().toISOString()}\n` +
        `• Motivo: Solicita asesor\n`;

      const { ok, fail } = await sendMessageToAgents({ message: msg });

      await flowDynamic(
        "✅ Listo. En un momento un asesor se comunicará contigo.\n\n" +
          "Para continuar con el asesor, espera su mensaje."
      );

      // (Opcional) log para ti
      if (fail.length) console.warn("Agent notify failed:", fail);
      console.log("Notified agents:", ok);
    } catch (e) {
      console.error(e);
      await flowDynamic(
        "⚠️ No pude notificar al asesor en este momento.\n\n" +
          "Intenta más tarde dentro del horario (L-V 8:00 a 16:00) o escribe a:\n" +
          "unidad.anticorrupcion@sanpedro.gob.mx"
      );
    }
  });
