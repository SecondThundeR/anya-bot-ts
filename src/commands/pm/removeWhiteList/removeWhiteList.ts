import { Composer } from 'grammy';
import RegularUtils from '../../../utils/regularUtils';
import otherMessages from '../../../locale/otherMessages';
import whiteListMessages from '../../../locale/whiteListMessages';
import AsyncUtils from '../../../utils/asyncUtils';
import ListsNames from '../../../enums/listsNames';
import RedisSingleton from '../../../utils/redisSingleton';

const removeWhiteList = new Composer();

removeWhiteList.command('removewhitelist', async ctx => {
    const creatorID = process.env.CREATOR_ID;
    const redisInstance = RedisSingleton.getInstance();
    const chatID = ctx.match;
    const userID = RegularUtils.getUserID(ctx);
    const whiteListIDs = await redisInstance.getAllList(ListsNames.WHITELIST);

    if (!RegularUtils.isBotCreator(userID, creatorID)) return;

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
