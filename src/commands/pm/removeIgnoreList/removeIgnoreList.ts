import { Composer } from 'grammy';
import RegularUtils from '../../../utils/regularUtils';
import otherMessages from '../../../locale/otherMessages';
import ignoreListMessages from '../../../locale/ignoreListMessages';
import RedisSingleton from '../../../utils/redisSingleton';
import ListsNames from '../../../enums/listsNames';

const removeIgnoreList = new Composer();

removeIgnoreList.command('removeignorelist', async ctx => {
    const creatorID = process.env.CREATOR_ID;
    const redisInstance = RedisSingleton.getInstance();
    const chatID = ctx.match;
    const userID = RegularUtils.getUserID(ctx);
    const ignoreListIDs = await redisInstance.getAllList(ListsNames.IGNORELIST);

    if (!RegularUtils.isBotCreator(userID, creatorID)) return;

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
