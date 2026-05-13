# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev      # Lint + watch mode (nodemon) — use during development
yarn build    # Compile TypeScript via Rollup → dist/app.js
yarn start    # Run compiled production build
yarn lint     # ESLint across all files
```

Node version: 20.11.1. Use **Yarn**, not npm.

## Architecture

WhatsApp chatbot for the **Unidad Anticorrupción** of San Pedro Garza García, México. Built on the **@builderbot/bot** framework with **@builderbot/provider-sherpa** as the WhatsApp provider and an in-memory database.

### Entry points

- `src/app.ts` — Creates the bot (provider + DB + flows), starts it on `PORT` (default 3080), and mounts Express REST endpoints.
- `src/bot.ts` — Exports the singleton `provider` and `database` instances used across the app.

### Conversation flow chain

Flows are registered in `src/flows/index.ts` and execute in this logical order:

1. **welcomeFlow** — Entry point; enforces an allowlist (`middlewares/allowlist.ts`), shows privacy notice.
2. **menuFlow** — Main menu (10 options: FAQs + complaint paths).
3. **denunciaFlow** — Routes between anonymous and identified complaint types.
4. **denunciaAnonimaFlow** / **denunciaIdentificadaFlow** — Collect reporter identity data.
5. **denunciaHechosFlow** — Collects the facts of the complaint, then calls `services/denuncia.ts` to POST to an external API.
6. **reconsultaFlow** — Complaint status lookup via folio number.
7. **agenteFlow** — Hands off to a human agent via `services/agente.ts`.

### REST API (Express, mounted in `app.ts`)

All write endpoints require the `authToken` middleware (Bearer token from env).

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/v1/messages` | Send a message to a user |
| POST | `/v1/register` | Trigger registration flow |
| POST | `/v1/blacklist` | Add/remove a number from the blacklist |
| GET | `/v1/blacklist/list` | List blocked numbers |
| GET | `/v1/messages` | Retrieve logged messages |

### Key patterns

- **Path alias** `~/` maps to `src/` (configured in `tsconfig.json` and `rollup.config.js`).
- **Environment config** is centralized in `src/config/env.ts` — add new env vars there.
- **Message persistence** writes to a JSON file via `services/message.ts`; the logger middleware (`middlewares/messageLogger.ts`) hooks into every incoming message.
- **Inactivity timeout** (`utils/inactivity.ts`) resets sessions after configurable idle time.
- **Business hours** and **timezone** are read from env vars and used in flow routing (e.g., to decide whether to offer live-agent transfer).
