import { addKeyword, utils } from "@builderbot/bot";
import { Provider, Database } from "../../bot";
import { DenunciaState } from "./denuncia.types";
import { extractMedia } from "./denuncia.utils";

import { sendMessageToAgents } from "../../services/broadcast";
import { isWithinBusinessHours } from "../../utils/time";
import { menuFlow } from "../menu.flow";

export const denunciaHechosFlow = addKeyword<Provider, Database>(
  utils.setEvent("DENUNCIA_HECHOS_FLOW"),
)
  // C) Hechos
  .addAnswer(
    "🧾 Escribe los hechos en *UN solo mensaje*, no importa que sea largo.:\n\n" +
      "*AVISO IMPORTANTE 1*: Tu relato debe responder a las siguientes preguntas: ¿Qué pasó?, ¿Cómo pasó?,¿Cuándo pasó? y ¿Dónde pasó?. Procura ser claro y preciso.\n\n",
    { capture: true },
    async (ctx, { state, fallBack }) => {
      const s = (await state.get("denuncia")) as DenunciaState | undefined;
      if (!s?.tipo) return fallBack("Escribe *Hola* para iniciar de nuevo.");

      const hechos = (ctx.body ?? "").trim();
      if (!hechos)
        return fallBack("Por favor describe los hechos en un solo mensaje.");

      await state.update({ denuncia: { ...s, hechos } });
      // (No mandas nada aquí; el siguiente addAnswer se ejecuta en el siguiente mensaje del usuario)
    },
  )

  // D) Ciclo de adjuntos: solo sale cuando escribe NO
  .addAnswer(
    "📎 Envía *fotos, videos, imágenes o documentos* como evidencia.\n\n" +
      "Si ya no deseas adjuntar evidencia, escribe *NO* para continuar.",
    { capture: true },
    async (ctx, { state, fallBack }) => {
      const sAny = (await state.get("denuncia")) as any;
      const s = sAny as DenunciaState | undefined;

      if (!s?.hechos)
        return fallBack("Primero necesito tu relato de los hechos.");

      const input = (ctx.body ?? "").trim().toLowerCase();

      // ✅ salir solo con NO
      if (input === "no") {
        await state.update({
          denuncia: { ...s, esperandoAdjunto: false } as any,
        });
        return; // siguiente bloque (info adicional) tomará el siguiente mensaje
      }

      // si no escribió NO, debe mandar media
      const media = extractMedia(ctx);
      if (!media) {
        return fallBack(
          "No detecté un archivo.\n\n" +
            "📎 Envía una foto/video/documento como evidencia, o escribe *NO* para continuar.",
        );
      }

      const adjuntos = Array.isArray(s.adjuntos) ? s.adjuntos : [];
      adjuntos.push({ kind: media.kind });

      await state.update({
        denuncia: { ...s, adjuntos, esperandoAdjunto: true } as any,
      });

      return fallBack(
        "✅ Evidencia recibida.\n\n" +
          "📎 Si deseas adjuntar *más evidencia*, envía otro archivo.\n" +
          "Si ya no deseas adjuntar más, escribe *NO* para continuar.",
      );
    },
  )

  // E) Ciclo de info adicional: solo sale cuando escribe NO
  .addAnswer(
    "🧩 Si deseas agregar *información adicional*, escríbela ahora en un solo mensaje.\n\n" +
      "Si ya no deseas agregar más información, escribe *NO* para continuar.",
    { capture: true },
    async (ctx, { state, flowDynamic, fallBack, gotoFlow }) => {
      const sAny = (await state.get("denuncia")) as any;
      const s = sAny as DenunciaState | undefined;

      if (!s?.hechos)
        return fallBack("Primero necesito tu denuncia (los hechos).");

      const input = (ctx.body ?? "").trim();

      // ✅ salir del ciclo solo con NO (literal)
      if (input.toLowerCase() === "no") {
        await state.update({
          denuncia: { ...s, esperandoInfoAdicional: false } as any,
        });

        // Notificar enlaces/agentes
        try {
          const esAnonima = s?.tipo === "anonima";

          const maskPhone = (n?: string) => {
            if (!n) return "N/D";
            const last4 = n.slice(-4);
            return `***${last4}`;
          };

          const numeroLinea = esAnonima
            ? `• Número (WhatsApp): ${maskPhone(ctx.from)} *(anónima)*\n`
            : `• Número (WhatsApp): ${ctx.from}\n`;

          const msg =
            "🚨 *Nueva denuncia recibida*\n\n" +
            `• Tipo: ${esAnonima ? "Anónima" : "Identificada"}\n` +
            `• Nombre/Alias: ${s?.nombre ?? "N/D"}\n` +
            numeroLinea +
            `• Fecha: ${new Date().toISOString()}\n\n` +
            "📌 *Acción sugerida:* Revisar la denuncia en la plataforma/API y dar seguimiento.";

          const { ok, fail } = await sendMessageToAgents({ message: msg });

          if (fail.length) console.warn("Enlace notify failed:", fail);
          console.log("Notified enlaces:", ok);
        } catch (e) {
          console.error(e);
          await flowDynamic(
            "⚠️ En este momento no pude notificar a un enlace.\n\n" +
              "Tu denuncia quedó registrada y será atendida a la brevedad.\n" +
              "Si lo prefieres, también puedes escribir a:\n" +
              "unidad.anticorrupcion@sanpedro.gob.mx",
          );
        }

        const dentro = isWithinBusinessHours();

        if (dentro) {
          await flowDynamic(
            "✅ *¡Gracias! Tu denuncia fue registrada.*\n\n" +
              "👤 Un enlace dará seguimiento a tu caso dentro del horario de atención.",
          );
        } else {
          await flowDynamic(
            "✅ *¡Gracias! Tu denuncia fue registrada.*\n\n" +
              "🕘 *Horario de atención:* Lunes a viernes | 08:00 a 16:00\n" +
              "📩 Si tu mensaje llega fuera de este horario, será atendido a la brevedad posible.",
          );
        }

        await flowDynamic("_Te regreso al menú principal..._");
        return gotoFlow(menuFlow);
      }

      // si mandó vacío
      if (!input) {
        return fallBack(
          "No recibí texto.\n\n" +
            "✍️ Escribe información adicional, o escribe *NO* para continuar.",
        );
      }

      // guardar y seguir en ciclo
      const arr = Array.isArray((s as any).infoAdicional)
        ? (s as any).infoAdicional
        : [];
      arr.push(input);

      await state.update({
        denuncia: {
          ...s,
          infoAdicional: arr,
          esperandoInfoAdicional: true,
        } as any,
      });

      return fallBack(
        "✅ Información adicional recibida.\n\n" +
          "✍️ Si deseas agregar *más*, escríbela ahora.\n" +
          "Si ya no deseas agregar más, escribe *NO* para continuar.",
      );
    },
  );
