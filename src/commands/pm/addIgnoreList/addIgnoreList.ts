import { Composer } from 'grammy';
import RegularUtils from '../../../utils/regularUtils';
import otherMessages from '../../../locale/otherMessages';
import ignoreListMessages from '../../../locale/ignoreListMessages';
import AsyncUtils from '../../../utils/asyncUtils';
import RedisSingleton from '../../../utils/redisSingleton';
import ListsNames from '../../../enums/listsNames';

const addIgnoreList = new Composer();

addIgnoreList.command('addignorelist', async ctx => {
    const redisInstance = RedisSingleton.getInstance();
    const chatID = ctx.match;
    const whiteListIDs = await redisInstance.getAllList(ListsNames.WHITELIST);
    const ignoreListIDs = await redisInstance.getAllList(ListsNames.IGNORELIST);

    if (!RegularUtils.isBotCreator(ctx)) return;

    if (RegularUtils.isStringEmpty(chatID))
        return await ctx.reply(otherMessages.noChatIDProvided);

    if (RegularUtils.isItemInList(chatID, ignoreListIDs))
        return await ctx.reply(ignoreListMessages.alreadyAdded);

    await redisInstance.pushValueToList(ListsNames.IGNORELIST, String(chatID));

    const isWhitelistedLocally = RegularUtils.isItemInList(
        chatID,
        whiteListIDs
    );
    if (isWhitelistedLocally)
        await redisInstance.removeValueFromList(
            ListsNames.WHITELIST,
            String(chatID)
        );

    const isInChat = await AsyncUtils.isBotInChat(ctx, chatID);
    if (isInChat) await AsyncUtils.leaveFromIgnoredChat(ctx, chatID);

    await ctx.reply(
        isWhitelistedLocally
            ? ignoreListMessages.addedAndUnwhitelisted
            : ignoreListMessages.added
    );
});

export default addIgnoreList;
