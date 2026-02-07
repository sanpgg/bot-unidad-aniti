import { addKeyword, utils } from "@builderbot/bot";
import { Provider, Database } from "../bot";

import { handleUserInteraction, clearInactivityTimeout, shouldReset } from "../utils/inactivity";
import { sleep } from "../utils/sleep";
import { reconsultaFlow } from "./reconsulta.flow";
import { agenteFlow } from "./agente.flow"
import { denunciaFlow } from "./denuncia/denuncia.flow";
import { welcomeFlow } from "./welcome.flow";


const menuOptions = [
  "1️⃣ Quiero presentar una denuncia por este medio.",
  "2️⃣ ¿Qué cosas puedo denunciar?",
  "3️⃣ ¿Qué se necesita para presentar una denuncia?",
  "4️⃣ ¿Se necesita evidencia para presentar una denuncia?",
  "5️⃣ ¿Las denuncias pueden ser anónimas?",
  "6️⃣ Otros canales de denuncia",
  "7️⃣ ¿Le puedo dar seguimiento a mi denuncia?",
  "8️⃣ ¿Que cosas NO se denuncian por este medio?",
  "9️⃣ ¿Quiero denunciar a un servidor público que NO trabaja en el Municipio de San Pedro? ",
  "🔟 Hablar con un agente",
].join("\n");

const respuestasMenu: Record<string, string> = {
  "1":
    `Puedes hacerlo a través de diversas vías, todas administradas por la Unidad Anticorrupción de la Secretaría de la Contraloría y Transparencia Municipal, las cuales son las siguientes:\n\n` +
    `🔹 Sistema Integral de Denuncias: https://denuncia.sanpedro.gob.mx/\n` +
    `🔹 Teléfono: 81-21-27-27-40\n` +
    `🔹 Correo electrónico: unidad.anticorrupcion@sanpedro.gob.mx\n` +
    `🔹 Presencial: En las oficinas ubicadas en calle Independencia #316 esquina con Corregidora en el 4to piso, Casco Urbano de San Pedro Garza García, Nuevo León.`,
  "2": `Conductas cometidas por servidores públicos del Municipio de San Pedro Garza García, o bien, por particulares que puedan constituir hechos de corrupción o faltas administrativas.`,
  "3":
    `Es necesario que proporciones elementos de tiempo, modo y lugar, es decir, que tu denuncia responda las siguientes preguntas:\n\n` +
    `❓ ¿Qué pasó?\n❓ ¿Cómo pasó?\n❓ ¿Cuándo pasó?\n❓ ¿Dónde pasó?\n\n` +
    `Procura ser claro y preciso, y mantener la calma al redactar tu denuncia.`,
  "4": `No es obligatorio, sin embargo, si tienes fotografías, videos, documentos o testigos, debes proporcionarlos en tu denuncia para fortalecer la investigación.`,
  "5": `Sí, puedes realizar tu denuncia de manera anónima y se le dará el trámite correspondiente. De igual forma, los datos que proporciones tendrán carácter confidencial.`,
  "6":
    `Las denuncias contra servidores públicos y particulares relacionados con el servicio público de San Pedro Garza García, Nuevo León son recibidas por la Unidad Anticorrupción de la Secretaría de la Contraloría ` +
    `y Transparencia Municipal. Puedes presentarla a través de las siguientes vías:.\n\n` +
    `🔹 Sistema Integral de Denuncias: https://denuncia.sanpedro.gob.mx/\n` +
    `🔹 Teléfono: 81-21-27-27-40\n` +
    `🔹 Correo electrónico: unidad.anticorrupcion@sanpedro.gob.mx\n` +
    `🔹 Presencial: Calle Independencia #316 esquina con Corregidora, 4to piso, Casco Urbano de San Pedro Garza García, Nuevo León.`,
  "7": `Sí, al presentar la denuncia en el Sistema Integral de Denuncias disponible en el siguiente enlace: \nhttps://denuncia.sanpedro.gob.mx/ se te proporcionará un número de folio, con él podrás darle seguimiento en esa misma plataforma.`,
  "8": `Quejas, tales como luminarias descompuestas, baches, problemas de drenaje, semáforos pueden ser denunciados en el Sistema de Atención Ciudadana, al que se puede acceder mediante el siguiente enlace: https://sanpedro.gob.mx/sam-petrino`,
  "9":
    `🔹Para denunciar a servidores públicos del Gobierno del Estado de Nuevo León ingresa en el siguiente enlace: \nhttps://app.st.nl.gob.mx/incorruptible/RegEmp.aspx \n\n` +
    `🔹 Para denunciar a servidores públicos del Gobierno Federal ingresa en el siguiente enlace: \nhttps://sidec.funcionpublica.gob.mx`,
};

export const menuFlow = addKeyword<Provider, Database>([
  "menú",
  "menu",
  utils.setEvent("MENU_FLOW") as any,
])
  .addAction(async (ctx, { flowDynamic, state }) => {
    await handleUserInteraction(
      ctx,
      flowDynamic,
      state,
      "Selecciona una opción del menú:\n\n" + menuOptions
    );
  })
  .addAnswer(
    "",
    { capture: true },
    async (ctx, { flowDynamic, fallBack, gotoFlow, state }) => {
      const inputRaw = (ctx.body ?? "").trim();
      const input = inputRaw.toLowerCase();

      if (shouldReset(inputRaw)) {
        return gotoFlow(welcomeFlow);
      }

      await clearInactivityTimeout(ctx, state);

      // Opción 1 y 10 por evento
      if (input === "1" || inputRaw.includes("1️⃣")) {
        return gotoFlow(denunciaFlow);
      }
      if (input === "10" || inputRaw.includes("🔟")) {
        return gotoFlow(agenteFlow);
      }
      if (input.toLowerCase() === "menu") {
        return gotoFlow(agenteFlow);
      }

      if (respuestasMenu[input]) {
        await flowDynamic(respuestasMenu[input]);
        await sleep(1500);
        return gotoFlow(reconsultaFlow);
      }

      return fallBack(
        "Por favor selecciona una opción válida del 1 al 10 o escribe *MENÚ* para verlas nuevamente."
      );
    }
  );
