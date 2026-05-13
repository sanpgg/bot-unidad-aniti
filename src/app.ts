import "dotenv/config";


import { createBot, createProvider, createFlow } from "@builderbot/bot";
import { Provider, Database } from "./bot";

import { env } from "./config/env";
import { authenticateToken } from "./middlewares/authToken";
import { initializeMessageLogger, logOutgoingMessage, getMessageService } from "./middlewares/messageLogger";

import { welcomeFlow, menuFlow, reconsultaFlow, denunciaFlow, agenteFlow, denunciaAnonimaFlow, 
  denunciaIdentificadaFlow, denunciaHechosFlow } from "./flows";

function ensureBot(bot: any, res: any) {
  if (!bot) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Bot not initialized" }));
    return null;
  }
  return bot;
}


const main = async () => {
  initializeMessageLogger();
  
  const adapterFlow = createFlow([
    welcomeFlow,
    menuFlow,
    reconsultaFlow,
    denunciaFlow,
    agenteFlow,
    denunciaAnonimaFlow,
    denunciaIdentificadaFlow,
    denunciaHechosFlow
  ]);

  //https://wppconnect.io/whatsapp-versions/
  const adapterProvider = createProvider(Provider, {
    version: [2, 3000, 1039410630] as any,
  });

  const adapterDB = new Database();

  const { handleCtx, httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  // endpoints existentes
  adapterProvider.server.post(
    "/v1/messages",
    authenticateToken,
    handleCtx(async (bot, req, res) => {

        const b = ensureBot(bot, res);
        if (!b) return;

        const { number, message, urlMedia } = req.body;
        await b.sendMessage(number, message, { media: urlMedia ?? null });
        await logOutgoingMessage(number, message, 'api_endpoint', urlMedia);
        return res.end("sended");

    })
  );

  adapterProvider.server.post(
    "/v1/register",
    authenticateToken,
    handleCtx(async (bot, req, res) => {
      const b = ensureBot(bot, res);
      
      if (!b) return;

      const { number, name } = req.body;
      await b.dispatch("REGISTER_FLOW", { from: number, name });
      return res.end("trigger");
    })
  );

  adapterProvider.server.post(
    "/v1/samples",
    authenticateToken,
    handleCtx(async (bot, req, res) => {

      const { number, name } = req.body;
      const b = ensureBot(bot, res);

      if (!b) return;

      await b.dispatch("SAMPLES", { from: number, name });
      return res.end("trigger");
    })
  );

  adapterProvider.server.post(
    "/v1/blacklist",
    authenticateToken,
    handleCtx(async (bot, req, res) => {
        const b = ensureBot(bot, res);
        
        if (!b) return;

        const { number, intent } = req.body;
        if (intent === "remove") b.blacklist.remove(number);
        if (intent === "add") b.blacklist.add(number);

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ status: "ok", number, intent }));
    })
  );

  adapterProvider.server.get(
    "/v1/blacklist/list",
    handleCtx(async (bot, req, res) => {
      const b = ensureBot(bot, res);
      if (!b) return;

      const blacklist = b.blacklist.getList();
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ status: "ok", blacklist }));
    })
  );

  adapterProvider.server.get(
    "/v1/messages",
    handleCtx(async (bot, req, res) => {
      const messageService = getMessageService();
      if (!messageService) {
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Message service not initialized" }));
      }

      const { phoneNumber, limit } = req.query;
      const messages = phoneNumber 
        ? await messageService.getMessagesByPhone(phoneNumber as string, parseInt(limit as string) || 50)
        : await messageService.getAllMessages(parseInt(limit as string) || 100);

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ status: "ok", messages }));
    })
  );

  httpServer(env.PORT);
};

main();
