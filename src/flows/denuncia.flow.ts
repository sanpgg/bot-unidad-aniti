import { addKeyword, utils } from "@builderbot/bot";
import { Provider, Database } from "../bot";
import { enviarDenuncia } from "../services/denuncia";
import { isValidEmail, isValidPhone } from "../utils/validators";
import { clearInactivityTimeout, handleUserInteraction, shouldReset } from "../utils/inactivity";

export const denunciaFlow = addKeyword<Provider, Database>(utils.setEvent("DENUNCIA_FLOW"))
  .addAnswer(
    "📝 *Denuncia guiada*\n\n" +
      "Describe los hechos e incluye:\n" +
      "• ¿Qué pasó?\n• Fecha aproximada\n• Lugar\n• Datos adicionales para identificar al funcionario o los hechos.",
    { capture: true },
    async (ctx, { state, flowDynamic, fallBack, gotoFlow }) => {
      const txt = (ctx.body ?? "").trim();
      if (shouldReset(txt)) return gotoFlow(utils.setEvent("WELCOME_FLOW") as any);
      if (txt.length < 10) return fallBack("Escribe una descripción más detallada (mínimo 10 caracteres).");

      await state.update({ denuncia_hechos: txt });

      await flowDynamic("¿Deseas que sea *anónima*?\n1️⃣ Sí\n2️⃣ No");
      await handleUserInteraction(ctx, flowDynamic, state, "");
    }
  )
  .addAnswer(
    "",
    { capture: true },
    async (ctx, { state, flowDynamic, fallBack, gotoFlow }) => {
      const r = (ctx.body ?? "").trim();
      if (shouldReset(r)) return gotoFlow(utils.setEvent("WELCOME_FLOW") as any);

      if (r === "1") {
        await state.update({ denuncia_anonima: true });
        await flowDynamic("¿Cuentas con *evidencia en imagen*?\n1️⃣ Sí\n2️⃣ No");
        return;
      }
      if (r === "2") {
        await state.update({ denuncia_anonima: false });
        await flowDynamic("Escribe tu *nombre completo*:");
        return;
      }
      return fallBack("Responde con *1* (Sí) o *2* (No).");
    }
  )
  // nombre (si no anónima)
  .addAnswer(
    "",
    { capture: true },
    async (ctx, { state, flowDynamic, gotoFlow }) => {
      const anon = await state.get("denuncia_anonima");
      if (anon === true) return;

      const nombre = (ctx.body ?? "").trim();
      if (shouldReset(nombre)) return gotoFlow(utils.setEvent("WELCOME_FLOW") as any);

      await state.update({ denuncia_nombre: nombre });
      await flowDynamic("Ahora proporciona un medio de contacto (*correo* o *teléfono*):");
    }
  )
  // contacto (si no anónima)
  .addAnswer(
    "",
    { capture: true },
    async (ctx, { state, flowDynamic, fallBack, gotoFlow }) => {
      const anon = await state.get("denuncia_anonima");
      if (anon === true) return;

      const contacto = (ctx.body ?? "").trim();
      if (shouldReset(contacto)) return gotoFlow(utils.setEvent("WELCOME_FLOW") as any);

      if (!isValidEmail(contacto) && !isValidPhone(contacto)) {
        return fallBack("Contacto inválido. Escribe un *correo* válido o un *teléfono*.");
      }

      await state.update({ denuncia_contacto: contacto });
      await flowDynamic("¿Cuentas con *evidencia en imagen*?\n1️⃣ Sí\n2️⃣ No");
    }
  )
  // evidencia sí/no
  .addAnswer(
    "",
    { capture: true },
    async (ctx, { state, flowDynamic, fallBack, gotoFlow }) => {
      const r = (ctx.body ?? "").trim();
      if (shouldReset(r)) return gotoFlow(utils.setEvent("WELCOME_FLOW") as any);

      if (r !== "1" && r !== "2") return fallBack("Responde con *1* (Sí) o *2* (No).");

      await state.update({ denuncia_tiene_evidencia: r === "1" });

      if (r === "1") {
        await flowDynamic("Envía la *imagen* (foto/archivo) aquí. Si no tienes, escribe *NO*.");
      } else {
        await state.update({ denuncia_imagen: null });
        await flowDynamic("Entendido, continuaré sin evidencia.\n\nEnviando tu denuncia…");
      }
    }
  )
  // recibir imagen o continuar
  .addAnswer(
    "",
    { capture: true },
    async (ctx, { state, flowDynamic, fallBack, gotoFlow }) => {
      await clearInactivityTimeout(ctx, state);

      const tiene = await state.get("denuncia_tiene_evidencia");
      if (tiene === true) {
        const body = (ctx.body ?? "").trim();
        if (shouldReset(body)) return gotoFlow(utils.setEvent("WELCOME_FLOW") as any);

        const media =
          (ctx as any).media ??
          (ctx as any).message?.image ??
          (ctx as any).message?.document ??
          null;

        if (!media) {
          if (["no", "n", "2"].includes(body.toLowerCase())) {
            await state.update({ denuncia_imagen: null });
            await flowDynamic("Entendido, continuaré sin evidencia.\n\nEnviando tu denuncia…");
          } else {
            return fallBack("No detecté una imagen. Envía una *foto/archivo* o escribe *NO*.");
          }
        } else {
          await state.update({ denuncia_imagen: media });
          await flowDynamic("✅ Imagen recibida.\n\nEnviando tu denuncia…");
        }
      }

      try {
        const payload = {
          from: ctx.from,
          pushName: ctx.pushName ?? null,
          anonima: (await state.get("denuncia_anonima")) ?? true,
          hechos: await state.get("denuncia_hechos"),
          nombre: (await state.get("denuncia_nombre")) ?? null,
          contacto: (await state.get("denuncia_contacto")) ?? null,
          evidencia: (await state.get("denuncia_imagen")) ?? null,
          fechaRegistro: new Date().toISOString(),
          canal: "whatsapp",
        };

        await enviarDenuncia(payload);

        await flowDynamic(
          "✅ Tu denuncia fue enviada correctamente.\n\n" +
            "Si deseas consultar otra opción, escribe *MENÚ*."
        );
      } catch {
        await flowDynamic(
          "⚠️ Ocurrió un problema al enviar tu denuncia.\n" +
            "Intenta más tarde o usa:\nhttps://denuncia.sanpedro.gob.mx/"
        );
      }

      return gotoFlow(utils.setEvent("RECONSULTA_FLOW") as any);
    }
  );
