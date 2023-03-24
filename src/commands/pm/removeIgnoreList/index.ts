import { Composer } from "grammy";

import ListsNames from "@data/listsNames";

import ignoreListMessages from "@locale/ignoreListMessages";
import otherMessages from "@locale/otherMessages";

import RedisSingleton from "@utils/redisSingleton";
import RegularUtils from "@utils/regularUtils";

const removeIgnoreList = new Composer();

removeIgnoreList.command("removeignorelist", async ctx => {
    const redisInstance = RedisSingleton.getInstance();
    const chatID = ctx.match;
    const ignoreListIDs = await redisInstance.getList(ListsNames.IGNORELIST);

    if (!RegularUtils.isBotCreator(ctx)) return;

    if (RegularUtils.isStringEmpty(chatID))
        return await ctx.reply(otherMessages.noChatIDProvided);

    if (!RegularUtils.isItemInList(chatID, ignoreListIDs))
        return await ctx.reply(ignoreListMessages.alreadyRemoved);

    await RedisSingleton.getInstance().removeValueFromList(
        ListsNames.IGNORELIST,
        String(chatID)
    );

    await ctx.reply(ignoreListMessages.removed);
});

export default removeIgnoreList;
