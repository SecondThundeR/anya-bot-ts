FROM node:24.19.0-slim AS base
WORKDIR /usr/src/app
ENV PNPM_HOME="/pnpm"
ENV COREPACK_HOME="/pnpm/corepack"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY package.json ./
RUN corepack prepare --activate && chmod -R a+rX "$COREPACK_HOME"

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    && mkdir -p /usr/share/keyrings \
    && curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
      | gpg --dearmor -o /usr/share/keyrings/postgres.gpg \
    && . /etc/os-release \
    && echo "deb [signed-by=/usr/share/keyrings/postgres.gpg] https://apt.postgresql.org/pub/repos/apt ${VERSION_CODENAME}-pgdg main" \
      > /etc/apt/sources.list.d/pgdg.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends postgresql-client-18 \
    && apt-get purge -y --auto-remove curl gnupg \
    && rm -rf /var/lib/apt/lists/*

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile

FROM base AS release
COPY --from=prod-deps --chown=node:node /usr/src/app/node_modules node_modules
COPY --from=build --chown=node:node /usr/src/app/dist dist
COPY --from=build --chown=node:node /usr/src/app/drizzle drizzle
COPY --from=build --chown=node:node /usr/src/app/locales locales
COPY --from=build --chown=node:node /usr/src/app/package.json .
COPY --chown=node:node pnpm-lock.yaml pnpm-workspace.yaml ./
RUN chown node:node /usr/src/app

USER node
ENTRYPOINT ["node", "./dist/main.mjs"]
