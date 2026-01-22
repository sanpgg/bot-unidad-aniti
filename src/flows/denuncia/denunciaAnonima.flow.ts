import { addKeyword, utils } from "@builderbot/bot";
import { Provider, Database } from "../../bot";
import { DenunciaState, ASK_HECHOS } from "./denuncia.types";
import { denunciaHechosFlow } from "./denunciaHechos.flow";

export const denunciaAnonimaFlow = addKeyword<Provider, Database>(utils.setEvent("DENUNCIA_ANONIMA_FLOW"))
  .addAnswer(
    "✅ Tu denuncia será *anónima*.",
    { capture: false },
    async (ctx, { state, gotoFlow, fallBack }) => {

         await state.update({
            denuncia: {
                tipo: "anonima",
                adjuntos: [],
                infoAdicional: [],
            } as DenunciaState,
        });
        
        
        return gotoFlow(denunciaHechosFlow);

    }
  );
