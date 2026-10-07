import { Composer } from "grammy";
import type { ChatMember } from "grammy/types";

import {
    getChatListStatus,
    setChatListStatus,
} from "#drizzle/queries/chats.js";
import type { Context } from "#root/bot/context.js";
import { isAdmin } from "#root/bot/filter/is-admin.js";
import {
    getCallbackData,
    getMessageID,
    isBotCanDelete,
} from "#root/bot/helpers/api.js";
import { leaveFromIgnoredChat } from "#root/bot/helpers/chat.js";
import { getWhiteListResponseLocale } from "#root/bot/helpers/general.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private").filter(isAdmin);

feature.on(
    "callback_query:data",
    logHandle("handler-pm-callback"),
    async (ctx) => {
        const splitData = getCallbackData(ctx).split("|");

        if (splitData.length !== 2) {
            return await ctx.answerCallbackQuery({
                text: ctx.t("otherMessages.callbackFailure"),
            });
        }

        const messageWithoutMarkup = await ctx.editMessageReplyMarkup({
            reply_markup: undefined,
        });
        const msgWithoutMarkupID =
            messageWithoutMarkup !== true
                ? getMessageID(messageWithoutMarkup)
                : undefined;
        const replyParameters = msgWithoutMarkupID
            ? { reply_parameters: { message_id: msgWithoutMarkupID } }
            : {};

        const [chatIDString, listMode] = splitData;
        const chatID = Number(chatIDString);
        const isAcceptingChat = listMode === "accept";
        const isIgnoringChat = listMode === "ignore";

        let botData: ChatMember;

        try {
            botData = await ctx.api.getChatMember(chatID, ctx.me.id);
        } catch {
            return await ctx.reply(
                ctx.t("keyboardMessages.keyboardError"),
                replyParameters,
            );
        }

        const listStatus = await getChatListStatus(chatID);

        if (isIgnoringChat && listStatus !== "ignored") {
            await setChatListStatus(chatID, "ignored");
            await leaveFromIgnoredChat(ctx, chatID);
        }

        if (isAcceptingChat && listStatus !== "whitelisted") {
            await setChatListStatus(chatID, "whitelisted");
            await ctx.api.sendMessage(
                chatID,
                ctx.t("whiteListMessages.accessGranted"),
            );

            const isBotIsntAdmin = !isBotCanDelete(botData);
            if (isBotIsntAdmin) {
                await ctx.api.sendMessage(
                    chatID,
                    ctx.t("otherMessages.botAdminHint"),
                );
            }
        }

        await ctx.answerCallbackQuery({
            text: ctx.t("otherMessages.callbackSuccess"),
        });

        await ctx.reply(
            getWhiteListResponseLocale(ctx, isAcceptingChat, isIgnoringChat),
            replyParameters,
        );
    },
);

export { composer as pmCallbackFeature };
