import { addKeyword, utils } from "@builderbot/bot";
import { Provider, Database } from "../../bot";
import { denunciaAnonimaFlow } from "./denunciaAnonima.flow";
import { denunciaIdentificadaFlow } from "./denunciaIdentificada.flow";

export const denunciaFlow = addKeyword<Provider, Database>(utils.setEvent("DENUNCIA_FLOW"))
  .addAnswer(
    "¿Quieres que tu denuncia sea *anónima* o *identificada*?\n\n1️⃣ Anónima\n2️⃣ Identificada",
    { capture: true },
    async (ctx, { gotoFlow, fallBack }) => {
      const input = (ctx.body ?? "").trim().toLowerCase();

      if (input === "1" || input.includes("anon")) {
        
        console.log("Inicia fow denuncia Anónima");
        return gotoFlow(denunciaAnonimaFlow);
      }
      if (input === "2" || input.includes("ident")){
        
        console.log("Inicia fow denuncia Identificada");
        return gotoFlow(denunciaIdentificadaFlow);

      } 

      return fallBack("Por favor responde con *1* (Anónima) o *2* (Identificada).");
    }
  );
