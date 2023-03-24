import { Composer } from "grammy";

import otherMessages from "@locale/otherMessages";
import stickerMessages from "@locale/stickerMessages";

import AsyncUtils from "@utils/asyncUtils";
import RedisSingleton from "@utils/redisSingleton";
import RegularUtils from "@utils/regularUtils";

import {
    deleteLocaleChangingStatus,
    getLocaleChangingStatus,
    setLocaleChangingStatus
} from "./helpers";

const messageLocale = new Composer();
const messageLocaleWaitTime = 10;

messageLocale.command("messagelocale", async ctx => {
    const redisInstance = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(
        redisInstance,
        "messagelocale"
    );

    if (await AsyncUtils.isCommandIgnored(ctx, redisInstance)) return;

    const [chatID, _, newLocaleString] = await AsyncUtils.extractContextData(
        ctx
    );

    if (!newLocaleString)
        return await ctx.reply(stickerMessages.noTextProvided, {
            reply_to_message_id: RegularUtils.getMessageID(ctx.update.message)
        });

    let messageLocaleChangeStatus = await getLocaleChangingStatus(
        redisInstance,
        chatID
    );

    if (messageLocaleChangeStatus)
        return await ctx.reply(stickerMessages.inProgress, {
            reply_to_message_id: RegularUtils.getMessageID(ctx.update.message)
        });

    await setLocaleChangingStatus(redisInstance, chatID);

    if (RegularUtils.isStringEmpty(newLocaleString))
        return await ctx.reply(otherMessages.stringIsEmpty);

    const userID = RegularUtils.getUserID(ctx);
    const keyboard = RegularUtils.getStickerMessageKeyboard(userID, chatID);

    const message = await ctx.reply(stickerMessages.mentionQuestion, {
        reply_markup: keyboard,
        reply_to_message_id: RegularUtils.getMessageID(ctx.update.message)
    });

    await redisInstance.setHashData(chatID, {
        stickerMessageLocale: newLocaleString
    });

    await AsyncUtils.asyncTimeout(messageLocaleWaitTime * 1000);

    messageLocaleChangeStatus = await getLocaleChangingStatus(
        redisInstance,
        chatID
    );

    if (!messageLocaleChangeStatus) return;

    try {
        await ctx.api.deleteMessage(chatID, message.message_id);
    } catch {
        console.log("Locale changing message was already deleted");
    }

    await deleteLocaleChangingStatus(redisInstance, chatID);
    await redisInstance.deleteHashData(chatID, [
        "stickerMessageLocale",
        "stickerMessageMention"
    ]);

    try {
        await ctx.reply(stickerMessages.timeoutError, {
            reply_to_message_id: RegularUtils.getMessageID(ctx.update.message)
        });
    } catch {
        await ctx.reply(stickerMessages.timeoutError);
    }
});

export default messageLocale;
