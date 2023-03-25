import { Composer } from "grammy";

import ListsNames from "@data/listsNames";

import otherMessages from "@locale/otherMessages";
import whiteListMessages from "@locale/whiteListMessages";

import AsyncUtils from "@utils/asyncUtils";
import RedisSingleton from "@utils/redisSingleton";
import RegularUtils from "@utils/regularUtils";

const addWhiteList = new Composer();

addWhiteList.command("addwhitelist", async ctx => {
    const redisInstance = RedisSingleton.getInstance();
    const chatID = ctx.match;
    const idsLists = await redisInstance.getLists([
        ListsNames.WHITELIST,
        ListsNames.IGNORELIST,
    ]);

    if (!RegularUtils.isBotCreator(ctx)) return;

    if (RegularUtils.isStringEmpty(chatID)) {
        return await ctx.reply(otherMessages.noChatIDProvided);
    }

    if (RegularUtils.isItemInList(chatID, idsLists[ListsNames.WHITELIST])) {
        return await ctx.reply(whiteListMessages.alreadyAdded);
    }

    await RedisSingleton.getInstance().pushValueToList(
        ListsNames.WHITELIST,
        String(chatID),
    );

    if (RegularUtils.isItemInList(chatID, idsLists[ListsNames.IGNORELIST])) {
        await RedisSingleton.getInstance().removeValueFromList(
            ListsNames.IGNORELIST,
            String(chatID),
        );
        return await ctx.reply(whiteListMessages.addedAndUnignored);
    }
    await ctx.reply(whiteListMessages.added);

    const isInChat = await AsyncUtils.isBotInChat(ctx, chatID);
    if (!isInChat) return;

    await AsyncUtils.sendAccessGrantedMessage(ctx, chatID);
    const botData = await ctx.api.getChatMember(chatID, ctx.me.id);
    if (!RegularUtils.isBotCanDelete(botData)) return;

    await ctx.api.sendMessage(
        chatID,
        otherMessages.botAdminWhitelistedHint,
    );
});

export default addWhiteList;
