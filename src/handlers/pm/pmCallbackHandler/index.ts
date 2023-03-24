import { Composer } from "@/deps.ts";
import { ChatMember, Message, Update } from "@/deps.ts";

import ListsNames from "@/data/listsNames.ts";

import keyboardMessages from "@/locale/keyboardMessages.ts";
import otherMessages from "@/locale/otherMessages.ts";

import AsyncUtils from "@/utils/asyncUtils.ts";
import RedisSingleton from "@/utils/redisSingleton.ts";
import RegularUtils from "@/utils/regularUtils.ts";

const pmCallbackHandler = new Composer();

pmCallbackHandler.on("callback_query:data", async (ctx) => {
    const splitData = RegularUtils.getCallbackData(ctx).split("|");
    const redisInstance = RedisSingleton.getInstance();
    const idsLists = await redisInstance.getLists([
        ListsNames.WHITELIST,
        ListsNames.IGNORELIST,
    ]);

    if (splitData.length !== 2) {
        return await ctx.answerCallbackQuery({
            text: otherMessages.callbackFailure,
        });
    }

    const originalMessage = (await ctx.editMessageReplyMarkup({
        reply_markup: undefined,
    })) as Update.Edited & Message;
    const [chatID, listMode] = splitData;
    const whiteListAccept = listMode === "accept";
    const ignoreListIgnore = listMode === "ignore";
    let botData: ChatMember | undefined = undefined;

    try {
        botData = await ctx.api.getChatMember(chatID, ctx.me.id);
    } catch {
        return await ctx.reply(keyboardMessages.keyboardError, {
            reply_to_message_id: RegularUtils.getMessageID(originalMessage),
        });
    }

    if (
        ignoreListIgnore &&
        !RegularUtils.isItemInList(chatID, idsLists[ListsNames.IGNORELIST])
    ) {
        await RedisSingleton.getInstance().pushValueToList(
            ListsNames.IGNORELIST,
            String(chatID),
        );
        await AsyncUtils.sendIgnoredMessage(ctx, chatID);
    }

    if (
        whiteListAccept &&
        !RegularUtils.isItemInList(chatID, idsLists[ListsNames.WHITELIST])
    ) {
        await RedisSingleton.getInstance().pushValueToList(
            ListsNames.WHITELIST,
            String(chatID),
        );
        await AsyncUtils.sendAccessGrantedMessage(ctx, chatID);
    }

    if (botData && !RegularUtils.isBotCanDelete(botData)) {
        await ctx.api.sendMessage(
            chatID,
            otherMessages.botAdminWhitelistedHint,
        );
    }

    await ctx.answerCallbackQuery({
        text: otherMessages.callbackSuccess,
    });

    await ctx.reply(
        RegularUtils.getWhiteListResponseLocale(
            whiteListAccept,
            ignoreListIgnore,
        ),
        {
            reply_to_message_id: RegularUtils.getMessageID(originalMessage),
        },
    );
});

export default pmCallbackHandler;
