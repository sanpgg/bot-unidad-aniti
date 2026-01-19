import { addKeyword, utils } from "@builderbot/bot";
import { Provider, Database } from "../bot";
import { handleUserInteraction, clearInactivityTimeout, shouldReset } from "../utils/inactivity";
import { menuFlow } from "./menu.flow";
import { welcomeFlow } from "./welcome.flow";

export const reconsultaFlow = addKeyword<Provider, Database>(
  utils.setEvent("RECONSULTA_FLOW")
)
  .addAnswer(
    "¿Deseas consultar otra opción?\n1️⃣ Sí\n2️⃣ No",
    {},
    async (ctx, { flowDynamic, state }) => {
      await handleUserInteraction(ctx, flowDynamic, state, "");
    }
  )
  .addAnswer(
    "",
    { capture: true },
    async (ctx, { flowDynamic, gotoFlow, fallBack, state }) => {
      await clearInactivityTimeout(ctx, state);

      const respuesta = (ctx.body ?? "").trim();
      if (shouldReset(respuesta)) {
        // Import circular safe: el menuFlow lo resolvemos desde index.ts con dispatch si quieres.
        // Aquí devolvemos un evento para que menu.flow lo atienda.
        return gotoFlow(welcomeFlow);
      }

      if (respuesta === "1") return gotoFlow(menuFlow);
      else{
        if (respuesta === "2") {
          await flowDynamic(
            "Gracias por contactarnos. Estamos para ayudarte. 👋\n\n" +
              "Si deseas comenzar de nuevo, puedes escribir la palabra *Hola*."
          );
        }
        else{
          return fallBack("Por favor responde con *1* para Sí o *2* para No.");
        }
      }
    }
  );
