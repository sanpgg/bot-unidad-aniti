import { addKeyword, utils } from "@builderbot/bot";
import { Provider, Database } from "../../bot";
import { DenunciaState, ASK_HECHOS } from "./denuncia.types";
import { menuFlow } from "../menu.flow";
import { logOutgoingMessage } from "../../middlewares/messageLogger";
import { sleep } from "../../utils/sleep";

export const denunciaAnonimaFlow = addKeyword<Provider, Database>(utils.setEvent("DENUNCIA_ANONIMA_FLOW"))
  .addAnswer(
    "Para garantizar el anonimato y la confidencialidad te invitamos a presentarla a través del Sistema Integral de Denuncias:\n\n https://denuncia.sanpedro.gob.mx/denuncia",
    { capture: false },
    async (ctx, { flowDynamic, gotoFlow }) => {

      /*await logOutgoingMessage(
        ctx.from,
        "Para garantizar el anonimato y la confidencialidad te invitamos a presentarla a través del Sistema Integral de Denuncias: https://denuncia.sanpedro.gob.mx/denuncia",
        'denuncia_anonima'
      );*/
      
      await sleep(2000);
      await flowDynamic("_Te enviaremos el menú principal para que puedas continuar con otras opciones:_");
      await sleep(2000);
      return gotoFlow(menuFlow);
    }
  );
