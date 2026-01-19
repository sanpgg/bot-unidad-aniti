import { isResetKeyword } from "./validators";

export async function setInactivityTimeout(
  ctx: any,
  flowDynamic: any,
  state: any,
  ms: number = 300000
) {
  const userId = ctx.from;

  const timerId = setTimeout(async () => {
    await flowDynamic(
      "Gracias por contactarnos. Estamos para ayudarte. 👋\n\n" +
        "Si deseas comenzar de nuevo, puedes escribir la palabra *Hola*."
    );
  }, ms);

  await state.update({ [`timeout_${userId}`]: timerId });
}

export async function clearInactivityTimeout(ctx: any, state: any) {
  const key = `timeout_${ctx.from}`;
  const previousTimeout = await state.get(key);
  if (previousTimeout) {
    clearTimeout(previousTimeout);
    await state.update({ [key]: null });
  }
}

export async function handleUserInteraction(
  ctx: any,
  flowDynamic: any,
  state: any,
  mensaje: string
) {
  await clearInactivityTimeout(ctx, state);

  if (mensaje && mensaje.trim().length > 0) {
    await flowDynamic(mensaje);
  }

  await setInactivityTimeout(ctx, flowDynamic, state);
}

/** Atajo: si escribe hola/menu, regresa true */
export function shouldReset(body: string) {
  return isResetKeyword(body);
}
