import { ChatMember, Composer } from "@/deps.ts";

import SetsNames from "@/constants/setsNames.ts";

import redisClient from "@/database/redisClient.ts";

import keyboardMessages from "@/locales/keyboardMessages.ts";
import otherMessages from "@/locales/otherMessages.ts";
import whiteListMessages from "@/locales/whiteListMessages.ts";

import {
    getCallbackData,
    getMessageID,
    isBotCanDelete,
} from "@/utils/apiUtils.ts";
import {
    getBotInChatInfo,
    leaveFromIgnoredChat,
    sendMessageByChatID,
} from "@/utils/asyncUtils.ts";
import { getWhiteListResponseLocale } from "@/utils/generalUtils.ts";

const pmCallbackHandler = new Composer();

pmCallbackHandler.on("callback_query:data", async (ctx) => {
    const splitData = getCallbackData(ctx).split("|");

    if (splitData.length !== 2) {
        return await ctx.answerCallbackQuery({
            text: otherMessages.callbackFailure,
        });
    }

    const messageWithoutMarkup = await ctx.editMessageReplyMarkup({
        reply_markup: undefined,
    });
    const msgWithoutMarkupID = messageWithoutMarkup !== true
        ? getMessageID(messageWithoutMarkup)
        : undefined;

    const [chatID, listMode] = splitData;
    const isAcceptingChat = listMode === "accept";
    const isIgnoringChat = listMode === "ignore";

    let botData: ChatMember | undefined;

    try {
        botData = await getBotInChatInfo(ctx, chatID);
    } catch {
        return await ctx.reply(keyboardMessages.keyboardError, {
            reply_to_message_id: msgWithoutMarkupID,
        });
    }

    if (
        isIgnoringChat &&
        await redisClient.isValueNotInSet(SetsNames.IGNORELIST, chatID)
    ) {
        await redisClient.addValuesToSet(
            SetsNames.IGNORELIST,
            chatID,
        );
        await leaveFromIgnoredChat(ctx, chatID);
    }

    if (
        isAcceptingChat &&
        await redisClient.isValueNotInSet(SetsNames.WHITELIST, chatID)
    ) {
        await redisClient.addValuesToSet(
            SetsNames.WHITELIST,
            chatID,
        );
        await sendMessageByChatID(ctx, chatID, whiteListMessages.accessGranted);

        const isBotIsntAdmin = !isBotCanDelete(botData);
        if (isBotIsntAdmin) {
            await ctx.api.sendMessage(
                chatID,
                otherMessages.botAdminHint,
            );
        }
    }

    await ctx.answerCallbackQuery({
        text: otherMessages.callbackSuccess,
    });

    await ctx.reply(
        getWhiteListResponseLocale(
            isAcceptingChat,
            isIgnoringChat,
        ),
        {
            reply_to_message_id: msgWithoutMarkupID,
        },
    );
});

export default pmCallbackHandler;
