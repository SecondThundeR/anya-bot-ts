import { Composer } from "grammy";

import {
    getChatListStatus,
    removeChatListStatus,
} from "#drizzle/queries/chats.js";
import type { Context } from "#root/bot/context.js";
import { isAdmin } from "#root/bot/filter/is-admin.js";
import { isBotInChat, sendMessageByChatID } from "#root/bot/helpers/chat.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private").filter(isAdmin);

feature.command(
    ["remwl", "silentremwl"],
    logHandle("command-remwl"),
    async (ctx) => {
        const chatID = Number(ctx.match);
        if (ctx.match === "" || !Number.isSafeInteger(chatID)) {
            return await ctx.reply(ctx.t("otherMessages.noChatIDProvided"));
        }

        if ((await getChatListStatus(chatID)) !== "whitelisted") {
            return await ctx.reply(ctx.t("whiteListMessages.alreadyRemoved"));
        }

        await removeChatListStatus(chatID);
        await ctx.reply(ctx.t("whiteListMessages.removed"));

        // Not `ctx.hasCommand(...)`: its type predicate would narrow `ctx`
        // to `never` for the rest of the handler
        const isInStealthMode = (ctx.msg.text ?? "").startsWith("/silentremwl");
        if (isInStealthMode) return;

        if (await isBotInChat(ctx, chatID)) {
            await sendMessageByChatID(
                ctx,
                chatID,
                ctx.t("whiteListMessages.accessRevoked"),
            );
        }
    },
);

export { composer as removeWhiteListFeature };
