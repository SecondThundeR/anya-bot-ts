import { Composer } from "grammy";
import type { ChatMember } from "grammy/types";

import {
    getChatListStatus,
    setChatListStatus,
} from "#drizzle/queries/chats.js";
import type { Context } from "#root/bot/context.js";
import { isAdmin } from "#root/bot/filter/is-admin.js";
import { isBotCanDelete } from "#root/bot/helpers/api.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private").filter(isAdmin);

feature.command("addwl", logHandle("command-addwl"), async (ctx) => {
    const chatID = Number(ctx.match);
    if (ctx.match === "" || !Number.isSafeInteger(chatID)) {
        return await ctx.reply(ctx.t("otherMessages.noChatIDProvided"));
    }

    const listStatus = await getChatListStatus(chatID);
    if (listStatus === "whitelisted") {
        return await ctx.reply(ctx.t("whiteListMessages.alreadyAdded"));
    }

    await setChatListStatus(chatID, "whitelisted");

    const isChatIgnored = listStatus === "ignored";

    await ctx.reply(
        isChatIgnored
            ? ctx.t("whiteListMessages.addedAndUnignored")
            : ctx.t("whiteListMessages.added"),
    );

    // getChatMember answers both questions at once: it fails when the bot is
    // not in the chat, and otherwise carries the permissions
    let botData: ChatMember;
    try {
        botData = await ctx.api.getChatMember(chatID, ctx.me.id);
    } catch {
        return;
    }

    await ctx.api.sendMessage(chatID, ctx.t("whiteListMessages.accessGranted"));

    if (isBotCanDelete(botData)) return;

    await ctx.api.sendMessage(chatID, ctx.t("otherMessages.botAdminHint"));
});

export { composer as addWhiteListFeature };
