import { Composer } from 'grammy';

import ListsNames from '@data/listsNames';

import otherMessages from '@locale/otherMessages';
import whiteListMessages from '@locale/whiteListMessages';

import AsyncUtils from '@utils/asyncUtils';
import RedisSingleton from '@utils/redisSingleton';
import RegularUtils from '@utils/regularUtils';

const removeWhiteList = new Composer();

removeWhiteList.command('removewhitelist', async ctx => {
    const redisInstance = RedisSingleton.getInstance();
    const chatID = ctx.match;
    const whiteListIDs = await redisInstance.getList(ListsNames.WHITELIST);

    if (!RegularUtils.isBotCreator(ctx)) return;

    if (RegularUtils.isStringEmpty(chatID))
        return await ctx.reply(otherMessages.noChatIDProvided);

    if (!RegularUtils.isItemInList(chatID, whiteListIDs))
        return await ctx.reply(whiteListMessages.alreadyRemoved);

    await RedisSingleton.getInstance().removeValueFromList(
        ListsNames.WHITELIST,
        String(chatID)
    );

    const isInChat = await AsyncUtils.isBotInChat(ctx, chatID);
    if (isInChat) await AsyncUtils.sendAccessRemovedMessage(ctx, chatID);

    await ctx.reply(whiteListMessages.removed);
});

export default removeWhiteList;
