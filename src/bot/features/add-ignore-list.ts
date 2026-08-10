import { Composer } from "grammy";

import {
    getChatListStatus,
    setChatListStatus,
} from "#drizzle/queries/chats.js";
import type { Context } from "#root/bot/context.js";
import { isAdmin } from "#root/bot/filter/is-admin.js";
import { isBotInChat, leaveFromIgnoredChat } from "#root/bot/helpers/chat.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private").filter(isAdmin);

feature.command("addil", logHandle("command-addil"), async (ctx) => {
    const chatID = Number(ctx.match);
    if (ctx.match === "" || !Number.isSafeInteger(chatID)) {
        return await ctx.reply(ctx.t("otherMessages.noChatIDProvided"));
    }

    const listStatus = await getChatListStatus(chatID);
    if (listStatus === "ignored") {
        return await ctx.reply(ctx.t("ignoreListMessages.alreadyAdded"));
    }

    await setChatListStatus(chatID, "ignored");

    const isChatWhitelisted = listStatus === "whitelisted";

    if (await isBotInChat(ctx, chatID)) {
        await leaveFromIgnoredChat(ctx, chatID);
    }

    await ctx.reply(
        isChatWhitelisted
            ? ctx.t("ignoreListMessages.addedAndUnwhitelisted")
            : ctx.t("ignoreListMessages.added"),
    );
});

export { composer as addIgnoreListFeature };
