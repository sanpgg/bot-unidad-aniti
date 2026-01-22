import { addKeyword, EVENTS, utils } from "@builderbot/bot";
import { Provider, Database } from "../bot";
import { isAllowedNumber } from "../middlewares/allowlist";
import { menuFlow } from "./menu.flow";


export const welcomeFlow = addKeyword<Provider, Database>([
  "hi",
  "hello",
  "hola",
  EVENTS.WELCOME,
  "menu",
  "menú",
  utils.setEvent("WELCOME_FLOW") as any,
]).addAction(async (ctx, { state, flowDynamic, gotoFlow }) => {
  //console.log(ctx.from)
  if (!isAllowedNumber(ctx.from)) {
    // ignora: no responde y corta flujo
    //console.log("Ignorado");
    return;
  } else {

    //console.log("No Ignorado");

    const name = ctx.pushName || "Usuario";
    await state.update({ name });

    await flowDynamic(
      `Bienvenid@\n\n` +
        `Usted se está comunicando a la *Unidad Anticorrupción de la Secretaría de la Contraloría y Transparencia* de *San Pedro Garza García, Nuevo León*.\n\n` +
        `Puedes ver nuestro aviso de privacidad ingresando al siguiente enlace:\n` +
        `http://bit.ly/4j6nC1X\n`
    );

    return gotoFlow(menuFlow);
  }
});
