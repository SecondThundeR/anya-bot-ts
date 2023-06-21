import { Composer } from "@/deps.ts";

import ListsNames from "@/constants/listsNames.ts";

import otherMessages from "@/locales/otherMessages.ts";
import whiteListMessages from "@/locales/whiteListMessages.ts";

import AsyncUtils from "@/utils/asyncUtils.ts";
import RedisSingleton from "@/database/redisSingleton.ts";
import RegularUtils from "@/utils/regularUtils.ts";

const removeWhiteList = new Composer();

removeWhiteList.command("removewhitelist", async (ctx) => {
    const redisInstance = RedisSingleton.getInstance();
    const chatID = ctx.match;
    const whiteListIDs = await redisInstance.getList(ListsNames.WHITELIST);

    if (!RegularUtils.isBotCreator(ctx)) return;

    if (RegularUtils.isStringEmpty(chatID)) {
        return await ctx.reply(otherMessages.noChatIDProvided);
    }

    if (!RegularUtils.isItemInList(chatID, whiteListIDs)) {
        return await ctx.reply(whiteListMessages.alreadyRemoved);
    }

    await RedisSingleton.getInstance().removeValueFromList(
        ListsNames.WHITELIST,
        String(chatID),
    );

    const isInChat = await AsyncUtils.isBotInChat(ctx, chatID);
    if (isInChat) await AsyncUtils.sendAccessRemovedMessage(ctx, chatID);

    await ctx.reply(whiteListMessages.removed);
});

export default removeWhiteList;
