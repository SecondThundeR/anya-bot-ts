import { Composer } from "@/deps.ts";

import {
    deleteLocaleChangingStatus,
    getLocaleChangingStatus,
    setLocaleChangingStatus,
} from "@/groupCommands/messageLocale/helpers.ts";

import { RedisClient } from "@/database/redisClient.ts";

import otherMessages from "@/locales/otherMessages.ts";
import stickerMessages from "@/locales/stickerMessages.ts";

import {
    getMessageID,
    getStickerMessageKeyboard,
    getUserID,
} from "@/utils/apiUtils.ts";
import { asyncTimeout, extractContextData } from "@/utils/asyncUtils.ts";

const messageLocaleWaitTime = 10;

const messageLocale = new Composer();

messageLocale.command("messagelocale", async (ctx) => {
    const [chatID, _, newLocaleString] = await extractContextData(
        ctx,
    );

    if (!newLocaleString) {
        return await ctx.reply(stickerMessages.noTextProvided, {
            reply_to_message_id: getMessageID(ctx.update.message),
        });
    }

    let messageLocaleChangeStatus = await getLocaleChangingStatus(
        chatID,
    );

    if (messageLocaleChangeStatus) {
        return await ctx.reply(stickerMessages.inProgress, {
            reply_to_message_id: getMessageID(ctx.update.message),
        });
    }

    await setLocaleChangingStatus(chatID);

    if (newLocaleString === "") {
        return await ctx.reply(otherMessages.stringIsEmpty);
    }

    const userID = getUserID(ctx);
    const keyboard = getStickerMessageKeyboard(chatID, userID);

    const message = await ctx.reply(stickerMessages.mentionQuestion, {
        reply_markup: keyboard,
        reply_to_message_id: getMessageID(ctx.update.message),
    });

    await RedisClient.setConfigData(chatID, {
        stickerMessageLocale: newLocaleString,
    });

    await asyncTimeout(messageLocaleWaitTime * 1000);

    messageLocaleChangeStatus = await getLocaleChangingStatus(
        chatID,
    );

    if (!messageLocaleChangeStatus) return;

    try {
        await ctx.api.deleteMessage(chatID, message.message_id);
    } catch {
        console.log("Locale changing message was already deleted");
    }

    await deleteLocaleChangingStatus(chatID);
    await RedisClient.removeFieldsFromConfig(
        chatID,
        "stickerMessageLocale",
        "stickerMessageMention",
    );

    try {
        await ctx.reply(stickerMessages.timeoutError, {
            reply_to_message_id: getMessageID(
                ctx.update.message,
            ),
        });
    } catch {
        await ctx.reply(stickerMessages.timeoutError);
    }
});

export default messageLocale;
