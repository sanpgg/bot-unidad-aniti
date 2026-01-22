import { addKeyword, utils } from "@builderbot/bot";
import { Provider, Database } from "../../bot";
import { DenunciaState, ASK_HECHOS } from "./denuncia.types";
import { denunciaHechosFlow } from "./denunciaHechos.flow";

export const denunciaIdentificadaFlow = addKeyword<Provider, Database>(
  utils.setEvent("DENUNCIA_IDENTIFICADA_FLOW")
)
  .addAnswer(
    "✅ Tu denuncia será *identificada*.\n\nIndica tu nombre o alias en un solo mensaje.",
    { capture: true },
    async (ctx, { state, flowDynamic, gotoFlow, fallBack }) => {
      const nombre = (ctx.body ?? "").trim();
      if (!nombre)
        return fallBack(
          "Por favor escribe tu *nombre o alias* en un solo mensaje."
        );

      const denuncia: DenunciaState = {
        tipo: "identificada",
        nombre,
        adjuntos: [],
        infoAdicional: [],
      };

      await state.update({ denuncia });

      // (Opcional) Capturar medio de contacto desde el inicio
      /*await flowDynamic(
        "o) Indica el medio de contacto por el cual deseas que te contactemos (correo o teléfono)."
      );*/

      /*return gotoFlow(
        addKeyword<Provider, Database>(utils.setEvent("DENUNCIA_CONTACTO_INICIAL"))
          .addAnswer(
            "📧 Escribe tu correo o teléfono:",
            { capture: true },
            async (ctx2, { state: state2, flowDynamic: fd2, gotoFlow: gf2, fallBack: fb2 }) => {
              const medio = (ctx2.body ?? "").trim();
              if (!medio) return fb2("Por favor escribe un *correo o teléfono*.");

              const s = (await state2.get("denuncia")) as DenunciaState | undefined;
              if (!s?.tipo) return fb2("Escribe *Hola* para iniciar de nuevo.");

              await state2.update({ denuncia: { ...s, medioContacto: medio } });

              await fd2(ASK_HECHOS);
              return gf2(denunciaHechosFlow);
            }
          )
          
      );*/
    }
  )
  .addAnswer(
    "📧 Indica el medio de contacto por el cual deseas que te contactemos (correo o teléfono).",
    { capture: true },
    async (ctx, { state, flowDynamic, gotoFlow, fallBack }) => {
      const s = (await state.get("denuncia")) as DenunciaState | undefined;
      if (!s?.tipo) return fallBack("Escribe *Hola* para iniciar de nuevo.");

      const contacto = (ctx.body ?? "").trim();
      if (!contacto)
        return fallBack(
          "Por favor escribe tu *correo o teléfono* en un solo mensaje."
        );

      await state.update({ medioContacto: { ...s, contacto } });

      return gotoFlow(denunciaHechosFlow);
    }
  );
