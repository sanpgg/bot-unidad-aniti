import { join } from 'path'
import { 
    createBot, 
    createProvider, 
    createFlow, 
    addKeyword, 
    utils,
    EVENTS 
} from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from 'builderbot-provider-sherpa'

const PORT = process.env.PORT ?? 3080

const handleUserInteraction = async (
  ctx: any,
  flowDynamic: any,
  state: any,
  mensaje: string
) => {
  const timeoutKey = `timeout_${ctx.from}`;
  const previousTimeout = await state.get(timeoutKey);

  if (previousTimeout) {
    clearTimeout(previousTimeout);
    await state.update({ [timeoutKey]: null });
  }

  await flowDynamic(mensaje);
  await setInactivityTimeout(ctx, flowDynamic, state);
};

const menuOptions = [
  "1️⃣ ¿Dónde puedo presentar una denuncia en contra de un servidor público de San Pedro?",
  "2️⃣ ¿Qué cosas puedo denunciar?",
  "3️⃣ ¿Qué se necesita para presentar una denuncia?",
  "4️⃣ ¿Se necesita evidencia para presentar una denuncia?",
  "5️⃣ ¿Las denuncias pueden ser anónimas?",
  "6️⃣ Quiero presentar una denuncia",
  "7️⃣ ¿Le puedo dar seguimiento a mi denuncia?",
  "8️⃣ ¿Que cosas NO se denuncian por este medio?",
  "9️⃣ ¿Quiero denunciar a un servidor público que NO trabaja en el Municipio de San Pedro? ",
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const setInactivityTimeout = async (
  ctx: any,
  flowDynamic: any,
  state: any,
  ms: number = 300000
) => {
  const userId = ctx.from;
  const timerId = setTimeout(async () => {
    await flowDynamic(
      "Gracias por contactarnos. Estamos para ayudarte. 👋\n\n" +
        "Si deseas comenzar de nuevo, puedes escribir la palabra *Hola*."
    );
  }, ms);

  await state.update({ [`timeout_${userId}`]: timerId });
};

const reconsultaFlow = addKeyword<Provider, Database>(
  utils.setEvent("RECONSULTA_FLOW")
)
  .addAnswer(
    "¿Deseas consultar otra opción?\n1️⃣ Sí\n2️⃣ No",
    {},
    async (ctx, { flowDynamic, state }) => {
      // ⏰ Establecer el timeout después de enviar la pregunta
      await handleUserInteraction(ctx, flowDynamic, state, "");
    }
  )
  .addAnswer(
    "",
    { capture: true },
    async (ctx, { flowDynamic, gotoFlow, fallBack, state }) => {
      const timeoutKey = `timeout_${ctx.from}`;
      const previousTimeout = await state.get(timeoutKey);

      if (previousTimeout) {
        clearTimeout(previousTimeout);
        await state.update({ [timeoutKey]: null });
      }

      const respuesta = ctx.body.trim();
      const input = respuesta.toLowerCase();

      if (["hola", "hi", "hello", "menu", "menú"].includes(input)) {
        return gotoFlow(welcomeFlow);
      }

      if (respuesta === "1") {
        return gotoFlow(menuFlow);
      } else if (respuesta === "2") {
        await flowDynamic(
          "Gracias por contactarnos. Estamos para ayudarte. 👋\n\n" +
            "Si deseas comenzar de nuevo, puedes escribir la palabra *Hola*."
        );
      } else {
        return fallBack("Por favor responde con *1* para Sí o *2* para No.");
      }
    }
  );


const menuFlow = addKeyword<Provider, Database>(["menú", "menu"])
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
      const input = ctx.body.trim().toLowerCase();

      // 🔁 Si el usuario quiere reiniciar el flujo
      if (["hola", "hi", "hello", "menu", "menú"].includes(input)) {
        return gotoFlow(welcomeFlow);
      }

      const timeoutKey = `timeout_${ctx.from}`;
      const previousTimeout = await state.get(timeoutKey);

      if (previousTimeout) {
        clearTimeout(previousTimeout);
        await state.update({ [`timeout_${ctx.from}`]: null });
      }

      if (respuestasMenu[input]) {
        await flowDynamic(respuestasMenu[input]);
        await sleep(1500);
        return gotoFlow(reconsultaFlow);
      } else {
        return fallBack(
          "Por favor selecciona una opción válida del 1 al 9 o escribe *MENÚ* para verlas nuevamente."
        );
      }
    }
  );

const welcomeFlow = addKeyword<Provider, Database>([
  "hi",
  "hello",
  "hola",
  EVENTS.WELCOME,
  "menu",
  "menú",
]).addAction(async (ctx, { state, flowDynamic, fallBack, gotoFlow }) => {
  const name = ctx.pushName || "Usuario";

  await state.update({ name });

  await flowDynamic(
    `Bienvenid@ *${name}*\n\n` +
      `Usted se está comunicando a la *Unidad Anticorrupción de la Secretaría de la Contraloría y Transparencia* de *San Pedro Garza García, Nuevo León*.\n\n` +
      `Puedes ver nuestro aviso de privacidad ingresando al siguiente enlace:\n` +
      `http://bit.ly/4j6nC1X\n`
  );
  return gotoFlow(menuFlow);
});


const usersBlocked = []; //['1418****']
const API_TOKEN = "bRGHEnYqkpeGwXXJAH2LHxYVQikttottwCfBGHVQ9ksrxJEVdN2mJgHYvqCpf9EGizpUpGgDA9vBffuYJXzvgEU7TthRnZPmTNZn";
    

function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];
  const expectedToken = `Bearer ${API_TOKEN}`;

  if (!token || token !== expectedToken) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Unauthorized" }));
  }

  next(); // Token válido
}

const main = async () => {
    const adapterFlow = createFlow([welcomeFlow, menuFlow, reconsultaFlow])
    
 const adapterProvider = createProvider(Provider, {
        version: [2, 3000, 1025190524],
        //browser: ["Windows", "Chrome", "Chrome 114.0.5735.198"],
        //writeMyself: true, // Escribe mensajes propios para ver conversación completa
        experimentalStore: true, // Significantly reduces resource consumption
        timeRelease: 86400000 // Cleans up data every 24 hours (in milliseconds)
    })


    const adapterDB = new Database()

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB
    })

    adapterProvider.server.post(
        '/v1/messages',
        authenticateToken,
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body
            await bot.sendMessage(number, message, { media: urlMedia ?? null })
            return res.end('sended')
        })
    )

    adapterProvider.server.post(
        '/v1/register',
        authenticateToken,
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('REGISTER_FLOW', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/samples',
        authenticateToken,
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('SAMPLES', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/blacklist',
        authenticateToken,
        handleCtx(async (bot, req, res) => {
            const { number, intent } = req.body
            if (intent === 'remove') bot.blacklist.remove(number)
            if (intent === 'add') bot.blacklist.add(number)

            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ status: 'ok', number, intent }))
        })
    )

    httpServer(+PORT)
}

main()
