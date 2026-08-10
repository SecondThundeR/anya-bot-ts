# anya-bot-ts

> [!WARNING]
> The bot is in maintenance mode. New features will most likely not appear

Some random TypeScript bot with interesting features based on the grammY library

A Telegram moderation bot for group chats: it removes premium stickers, custom
emoji, voice and video messages according to per-chat settings, and answers
with configurable wording. Groups are opt-in — the bot only works where an
admin has whitelisted it.

Built with [grammY](https://grammy.dev), [Hono](https://hono.dev),
[Drizzle ORM](https://orm.drizzle.team) and PostgreSQL.

Live instance of bot: [@antipremiumbullshit_bot](https://t.me/antipremiumbullshit_bot)

## Requirements

- Node.js 24 (see `.nvmrc`)
- pnpm 11
- PostgreSQL 18
- `postgresql-client` — `/export` and the import flow shell out to `pg_dump`
  and `pg_restore`. The Docker image installs it; a local machine needs it on
  `PATH` for those two commands only.

## Getting started

```bash
pnpm install
cp .env.example .env   # then fill in BOT_TOKEN, DATABASE_URL and ADMIN_IDS
pnpm db:migrate
pnpm dev
```

## Configuration

All configuration comes from the environment; `.env` is loaded automatically
in development. See `.env.example` for the full list.

| Variable | Required | Description |
|---|---|---|
| `BOT_TOKEN` | yes | Telegram bot token |
| `DATABASE_URL` | yes | PostgreSQL connection URL |
| `ADMIN_IDS` | — | JSON array of user IDs allowed to run admin commands in PM, e.g. `[123, 456]` |
| `BOT_MODE` | yes | `polling` or `webhook` |
| `BOT_ALLOWED_UPDATES` | — | JSON array of update types, empty for the defaults |
| `LOG_LEVEL` | — | `trace` … `silent`, defaults to `info` |
| `USE_DEBUG` | — | `true` enables pretty logs and per-update tracing |

Webhook mode additionally needs `BOT_WEBHOOK` (public URL ending in
`/webhook`), `BOT_WEBHOOK_SECRET` (12+ characters, e.g.
`openssl rand --hex 32`), and optionally `SERVER_HOST` / `SERVER_PORT`.

In polling mode no HTTP server is started. In webhook mode Hono serves
`POST /webhook` plus `GET /` as a health check.

## Commands

**In groups** (admins only, except `/dice`): `/help`, `/silent`, `/aidenmode`,
`/aidensilent`, `/adminpower`, `/noemoji`, `/dice`, and the wording commands
`/messagelocale`, `/silentonlocale`, `/silentofflocale` with their
`…reset` counterparts.

**In private chat** (only for `ADMIN_IDS`): `/start`, `/help`, `/addwl`,
`/remwl`, `/silentremwl`, `/getwl`, `/addil`, `/remil`, `/getil`,
`/getcmdusage`, `/export`, `/uptime`, `/setcommands`.

`/export` sends a `pg_dump` archive. Sending that `.dump` file back to the bot
starts a restore, which asks for confirmation first — it replaces the entire
database.

## Development

```bash
pnpm dev         # watch mode
pnpm typecheck   # tsc
pnpm lint        # biome check
pnpm lint:write  # biome check --write
pnpm test        # node --test
pnpm build       # tsdown -> dist/main.mjs
```

Tests are plain `node:test` files next to the code they cover. They never
reach a database, but importing the bot's modules constructs a postgres-js
client, so `DATABASE_URL` has to be set — any syntactically valid URL will do,
since the client connects lazily.

## Database

Schema lives in `drizzle/schema.ts`. Per-chat settings are stored as a sparse
JSONB `config` column: a missing key means "use the default", so a new setting
needs no migration.

```bash
pnpm db:generate   # generate a migration from schema changes
pnpm db:migrate    # apply pending migrations
```

## Deployment

The `Dockerfile` builds the bundle and ships it with `postgresql-client`.
Migrations are not run by the entrypoint — run `pnpm db:migrate` as a
pre-deploy step.

The image ships `dist/` and `drizzle/`, but not `src/`, and `pnpm db:migrate`
runs `drizzle/migrate.ts` from source. So `drizzle/` must stay self-contained:
importing `#root/*` from there resolves to `src/`, which only exists at build
time. A lint rule in `biome.json` enforces this.

## License

MIT — see [LICENSE](LICENSE)
