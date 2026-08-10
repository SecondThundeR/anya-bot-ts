import { Composer } from "grammy";

import { updateChatConfig } from "#drizzle/queries/chats.js";
import type { Context } from "#root/bot/context.js";
import { extractContextData } from "#root/bot/helpers/chat.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType(["group", "supergroup"]);

feature.command(
    "silentofflocale",
    logHandle("command-silentofflocale"),
    async (ctx) => {
        const [chatID, newLocaleString] = extractContextData(ctx);

        if (newLocaleString === "") {
            return await ctx.reply(ctx.t("otherMessages.stringIsEmpty"));
        }

        await updateChatConfig(chatID, {
            silentOffLocale: newLocaleString,
        });

        await ctx.reply(ctx.t("silentMessages.disabledMessageChange"));
    },
);

export { composer as silentOffLocaleFeature };
