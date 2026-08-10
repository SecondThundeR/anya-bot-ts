declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV?: "development" | "production";
            BOT_TOKEN: string;
            BOT_MODE?: "polling" | "webhook";
            BOT_ALLOWED_UPDATES?: string;
            BOT_WEBHOOK?: string;
            BOT_WEBHOOK_SECRET?: string;
            SERVER_HOST?: string;
            SERVER_PORT?: string;
            ADMIN_IDS?: string;
            LOG_LEVEL?:
                | "trace"
                | "debug"
                | "info"
                | "warn"
                | "error"
                | "fatal"
                | "silent";
            USE_DEBUG?: string;
            DATABASE_URL: string;
        }
    }
}

export {};
