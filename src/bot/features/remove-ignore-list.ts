import { Composer } from "grammy";

import {
    getChatListStatus,
    removeChatListStatus,
} from "#drizzle/queries/chats.js";
import type { Context } from "#root/bot/context.js";
import { isAdmin } from "#root/bot/filter/is-admin.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private").filter(isAdmin);

feature.command("remil", logHandle("command-remil"), async (ctx) => {
    const chatID = Number(ctx.match);
    if (ctx.match === "" || !Number.isSafeInteger(chatID)) {
        return await ctx.reply(ctx.t("otherMessages.noChatIDProvided"));
    }

    if ((await getChatListStatus(chatID)) !== "ignored") {
        return await ctx.reply(ctx.t("ignoreListMessages.alreadyRemoved"));
    }

    await removeChatListStatus(chatID);
    await ctx.reply(ctx.t("ignoreListMessages.removed"));
});

export { composer as removeIgnoreListFeature };
