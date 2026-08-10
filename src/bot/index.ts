import { autoChatAction } from "@grammyjs/auto-chat-action";
import { hydrate } from "@grammyjs/hydrate";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";
import { sequentialize } from "@grammyjs/runner";
import { type BotConfig, Bot as TelegramBot } from "grammy";
import type { Config } from "#root/config.js";
import type { Logger } from "#root/logger.js";
import type { Context } from "./context.ts";
import { addIgnoreListFeature } from "./features/add-ignore-list.ts";
import { addWhiteListFeature } from "./features/add-white-list.ts";
import { adminPowerTriggerFeature } from "./features/admin-power-trigger.ts";
import { aidenModeFeature } from "./features/aiden-mode.ts";
import { aidenSilentTriggerFeature } from "./features/aiden-silent-trigger.ts";
import { customEmojisFeature } from "./features/custom-emojis.ts";
import { diceGameFeature } from "./features/dice-game.ts";
import { exportDatabaseFeature } from "./features/export-database.ts";
import { getCommandsUsageFeature } from "./features/get-commands-usage.ts";
import { getIgnoreListFeature } from "./features/get-ignore-list.ts";
import { getWhiteListFeature } from "./features/get-white-list.ts";
import { groupCallbackFeature } from "./features/group-callback.ts";
import { helpGroupMessageFeature } from "./features/help-group-message.ts";
import { helpPMMessageFeature } from "./features/help-pm-message.ts";
import { importFileFeature } from "./features/import-file.ts";
import { inlineNicknameGeneratorFeature } from "./features/inline-nickname-generator.ts";
import { messageLocaleFeature } from "./features/message-locale.ts";
import { messageLocaleResetFeature } from "./features/message-locale-reset.ts";
import { newChatFeature } from "./features/new-chat.ts";
import { noCustomEmojiFeature } from "./features/no-custom-emoji.ts";
import { pmCallbackFeature } from "./features/pm-callback.ts";
import { premiumStickersFeature } from "./features/premium-stickers.ts";
import { removeIgnoreListFeature } from "./features/remove-ignore-list.ts";
import { removeWhiteListFeature } from "./features/remove-white-list.ts";
import { setCommandsFeature } from "./features/set-commands.ts";
import { silentOffLocaleFeature } from "./features/silent-off-locale.ts";
import { silentOffLocaleResetFeature } from "./features/silent-off-locale-reset.ts";
import { silentOnLocaleFeature } from "./features/silent-on-locale.ts";
import { silentOnLocaleResetFeature } from "./features/silent-on-locale-reset.ts";
import { silentTriggerFeature } from "./features/silent-trigger.ts";
import { startMessageFeature } from "./features/start-message.ts";
import { unhandledFeature } from "./features/unhandled.ts";
import { uptimeFeature } from "./features/uptime.ts";
import { voiceAndVideoFeature } from "./features/voice-and-video.ts";
import { errorHandler } from "./handlers/error.ts";
import { i18n } from "./i18n.ts";
import { checkForAdminCommand } from "./middlewares/check-for-admin-command.ts";
import { checkForWhitelist } from "./middlewares/check-for-whitelist.ts";
import { incrementCommandUsage } from "./middlewares/increment-command-usage.ts";
import { syncChatInfo } from "./middlewares/sync-chat-info.ts";
import { updateLogger } from "./middlewares/update-logger.ts";

interface Dependencies {
    config: Config;
    logger: Logger;
}

// Keeps every update from one user (or one chat, for anonymous senders)
// on a single sequential queue
function getUpdateKey(ctx: Context) {
    return ctx.from?.id.toString() || ctx.chat?.id.toString();
}

export function createBot(
    token: string,
    dependencies: Dependencies,
    botConfig?: BotConfig<Context>,
) {
    const { config, logger } = dependencies;

    const bot = new TelegramBot<Context>(token, botConfig);

    bot.use(async (ctx, next) => {
        ctx.config = config;
        ctx.logger = logger.child({
            update_id: ctx.update.update_id,
        });

        await next();
    });

    const protectedBot = bot.errorBoundary(errorHandler);

    // Middlewares
    bot.api.config.use(parseMode("HTML"));

    if (config.isPollingMode) {
        protectedBot.use(sequentialize(getUpdateKey));
    }
    if (config.isDebug) {
        protectedBot.use(updateLogger());
    }
    protectedBot.use(autoChatAction(bot.api));
    protectedBot.use(hydrateReply);
    protectedBot.use(hydrate());
    protectedBot.use(i18n);

    // Inline mode
    protectedBot.use(inlineNicknameGeneratorFeature);

    // Group handlers
    const groupBot = protectedBot.chatType(["group", "supergroup"]);
    groupBot.use(checkForWhitelist());
    groupBot.use(syncChatInfo());
    groupBot.use(checkForAdminCommand());
    groupBot.use(incrementCommandUsage());
    groupBot.use(adminPowerTriggerFeature);
    groupBot.use(aidenModeFeature);
    groupBot.use(aidenSilentTriggerFeature);
    groupBot.use(diceGameFeature);
    groupBot.use(helpGroupMessageFeature);
    groupBot.use(messageLocaleFeature);
    groupBot.use(messageLocaleResetFeature);
    groupBot.use(noCustomEmojiFeature);
    groupBot.use(silentOffLocaleFeature);
    groupBot.use(silentOffLocaleResetFeature);
    groupBot.use(silentOnLocaleFeature);
    groupBot.use(silentOnLocaleResetFeature);
    groupBot.use(silentTriggerFeature);
    groupBot.use(groupCallbackFeature);
    groupBot.use(customEmojisFeature);
    groupBot.use(newChatFeature);
    groupBot.use(premiumStickersFeature);
    groupBot.use(voiceAndVideoFeature);

    // PM handlers
    protectedBot.use(addIgnoreListFeature);
    protectedBot.use(addWhiteListFeature);
    protectedBot.use(exportDatabaseFeature);
    protectedBot.use(getCommandsUsageFeature);
    protectedBot.use(getIgnoreListFeature);
    protectedBot.use(getWhiteListFeature);
    protectedBot.use(helpPMMessageFeature);
    protectedBot.use(removeIgnoreListFeature);
    protectedBot.use(removeWhiteListFeature);
    protectedBot.use(setCommandsFeature);
    protectedBot.use(startMessageFeature);
    protectedBot.use(uptimeFeature);
    // Before pmCallbackFeature, which otherwise swallows every private callback
    protectedBot.use(importFileFeature);
    protectedBot.use(pmCallbackFeature);

    // must be the last handler
    protectedBot.use(unhandledFeature);

    return bot;
}

export type Bot = ReturnType<typeof createBot>;
