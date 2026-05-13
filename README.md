# Bot Unidad de Anticorrupción

Este proyecto está construido con **Node.js 20.11.1** y utiliza **Yarn** como gestor de paquetes.

## 🚀 Instalación

Clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/usuario/proyecto.git
cd proyecto
yarn install
```

## 📊 Modo Desarrollo

Para iniciar el proyecto en modo desarrollo, usa:

```bash
yarn dev
```

## 🏗️ Modo Producción

Para producción, ejecuta:

```bash
yarn install
yarn build
yarn start
```

## 🖥️ Ejecutar en segundo plano con `tmux`

Si deseas mantener el servicio activo después de cerrar la terminal, puedes usar `tmux`:

```bash
tmux new -s bot-unidad
yarn start

# Luego presiona Ctrl + B, suelta ambas teclas y presiona D para salir del panel sin detener el proceso.
```

Para volver a conectarte:

```bash
tmux attach -t bot-unidad
```

## 🌐 Puerto por defecto

La aplicación corre por defecto en el puerto `3080`. Puedes cambiar este valor desde las variables de entorno o la configuración del proyecto según sea necesario.

## 🚀 Deploy al servidor

Compila localmente y sube el build al servidor con un solo comando:

```bash
./deploy.sh usuario@ip-del-servidor
```

El script hace automáticamente: build local → sube `dist/app.js` por SCP → mata el proceso en el puerto 3080 → reinicia el bot en la sesión tmux `bot-unidad`.

---

## ⚠️ Error recurrente: versión de WhatsApp desactualizada

El provider Sherpa requiere que la versión de WhatsApp en `src/app.ts` esté vigente. WhatsApp publica nuevas versiones frecuentemente y las anteriores expiran (~2 meses).

**Síntoma:** el bot deja de conectarse o recibir mensajes.

### Pasos para resolverlo

1. Consultar la versión más reciente en: https://wppconnect.io/whatsapp-versions/

2. Tomar el número de la versión más reciente, por ejemplo `2.3000.1039410630`.

3. Editar `src/app.ts` y actualizar el array `version`:

```typescript
// Antes
version: [2, 3000, 1034143497] as any,

// Después (con la versión nueva)
version: [2, 3000, 1039410630] as any,
```

> El formato es `[major, minor, patch]` — ignorar el sufijo `-alpha` que aparece en la página.

4. Hacer deploy:

```bash
./deploy.sh usuario@ip-del-servidor
```

### Pasos manuales (sin usar deploy.sh)

**1. Conectarse al servidor por SSH:**
```bash
ssh usuario@ip-del-servidor
```

**2. Ir al directorio del proyecto:**
```bash
cd /var/www/bot-unidad/src
```

**3. Editar el archivo y actualizar la versión:**
```bash
nano app.ts
```
Buscar la línea con `version:` y reemplazar el último número por el de la versión nueva. Guardar con `Ctrl + O`, salir con `Ctrl + X`.

**4. Obtener el PID del proceso activo en el puerto 3080:**
```bash
sudo lsof -i :3080
```

**5. Matar el proceso (reemplazar el número por el PID real):**
```bash
sudo kill -9 <PID>
```

**6. Conectarse a la sesión tmux:**
```bash
tmux attach -t bot-unidad
```

**7. Compilar y arrancar el bot:**
```bash
cd /var/www/bot-unidad
sudo yarn build
sudo yarn start
```

> Para salir de tmux sin detener el proceso: `Ctrl + B`, luego `D`.

<p align="center">
  <a href="https://github.com/jorgechavarriaga/builder_bot_baileys_examples">
    <h2 align="center">Ejemplo</h2>
  </a>
</p>

<p align="center">
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@builderbot/bot">
    <img alt="" src="https://img.shields.io/npm/v/@builderbot/bot?color=%2300c200&label=%40bot-whatsapp">
  </a>
  <a aria-label="Join the community on GitHub" href="https://link.codigoencasa.com/DISCORD">
    <img alt="" src="https://img.shields.io/discord/915193197645402142?logo=discord">
  </a>
</p>

## Getting Started

With this library, you can build automated conversation flows agnostic to the WhatsApp provider, set up automated responses for frequently asked questions, receive and respond to messages automatically, and track interactions with customers. Additionally, you can easily set up triggers to expand functionalities limitlessly.

```

npm create builderbot@latest

```

## Documentation

Visit [builderbot](https://builderbot.vercel.app/) to view the full documentation.

## Official Course

If you want to discover all the functions and features offered by the library you can take the course.
[View Course](https://app.codigoencasa.com/courses/builderbot?refCode=LEIFER)

## Contact Us

- [💻 Discord](https://link.codigoencasa.com/DISCORD)
- [👌 𝕏 (Twitter)](https://twitter.com/leifermendez)

```

```