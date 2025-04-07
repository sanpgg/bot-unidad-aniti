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
```

Luego presiona `Ctrl+B` seguido de `D` para salir del panel sin detener el proceso.

Para volver a conectarte:

```bash
tmux attach -t bot-unidad
```

## 🌐 Puerto por defecto

La aplicación corre por defecto en el puerto `3080`. Puedes cambiar este valor desde las variables de entorno o la configuración del proyecto según sea necesario.

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
