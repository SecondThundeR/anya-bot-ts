import { run } from "@grammyjs/runner";

import { db } from "#drizzle/db.js";
import { createBot } from "./bot/index.ts";
import { config, type PollingConfig, type WebhookConfig } from "./config.ts";
import { createLifecycle } from "./lifecycle.ts";
import { logger } from "./logger.ts";
import { createServer, createServerManager } from "./server/index.ts";

const lifecycle = createLifecycle(logger);

// Registered first so it runs last, after the runner/server hooks
// have drained in-flight updates
lifecycle.onShutdown(() => db.$client.end({ timeout: 5 }));

async function startPolling(config: PollingConfig) {
    const bot = createBot(config.botToken, {
        config,
        logger,
    });

    await Promise.all([bot.init(), bot.api.deleteWebhook()]);

    const runner = run(bot, {
        runner: {
            fetch: {
                allowed_updates: config.botAllowedUpdates,
            },
        },
    });
    lifecycle.onShutdown(() => runner.stop());

    logger.info({
        msg: "Bot running...",
        username: bot.botInfo.username,
    });
}

async function startWebhook(config: WebhookConfig) {
    const bot = createBot(config.botToken, {
        config,
        logger,
    });
    const server = createServer({
        bot,
        config,
        logger,
    });
    const serverManager = createServerManager(server, {
        host: config.serverHost,
        port: config.serverPort,
    });

    // to prevent receiving updates before the bot is ready
    await bot.init();

    const info = await serverManager.start();
    lifecycle.onShutdown(() => serverManager.stop());
    logger.info({
        msg: "Server started",
        url: info.url,
    });

    await bot.api.setWebhook(config.botWebhook, {
        allowed_updates: config.botAllowedUpdates,
        secret_token: config.botWebhookSecret,
    });
    logger.info({
        msg: "Webhook was set",
        url: config.botWebhook,
    });
}

try {
    if (config.isWebhookMode) {
        await startWebhook(config);
    } else if (config.isPollingMode) {
        await startPolling(config);
    } else {
        throw new Error("Bot config matches neither webhook nor polling mode");
    }
} catch (error) {
    logger.error(error);
    await lifecycle.shutdown(1);
}
