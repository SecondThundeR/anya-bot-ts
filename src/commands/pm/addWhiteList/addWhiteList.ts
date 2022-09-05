import { Composer } from 'grammy';
import RegularUtils from '../../../utils/regularUtils';
import otherMessages from '../../../locale/otherMessages';
import whiteListMessages from '../../../locale/whiteListMessages';
import AsyncUtils from '../../../utils/asyncUtils';
import RedisSingleton from '../../../utils/redisSingleton';
import ListsNames from '../../../enums/listsNames';

const addWhiteList = new Composer();

addWhiteList.command('addwhitelist', async ctx => {
    const redisInstance = RedisSingleton.getInstance();
    const chatID = ctx.match;
    const whiteListIDs = await redisInstance.getAllList(ListsNames.WHITELIST);
    const ignoreListIDs = await redisInstance.getAllList(ListsNames.IGNORELIST);

    if (!RegularUtils.isBotCreator(ctx)) return;

    if (RegularUtils.isStringEmpty(chatID))
        return await ctx.reply(otherMessages.noChatIDProvided);

    if (RegularUtils.isItemInList(chatID, whiteListIDs))
        return await ctx.reply(whiteListMessages.alreadyAdded);

    await RedisSingleton.getInstance().pushValueToList(
        ListsNames.WHITELIST,
        String(chatID)
    );

    if (RegularUtils.isItemInList(chatID, ignoreListIDs)) {
        await RedisSingleton.getInstance().removeValueFromList(
            ListsNames.IGNORELIST,
            String(chatID)
        );
        return await ctx.reply(whiteListMessages.addedAndUnignored);
    }

    const isInChat = await AsyncUtils.isBotInChat(ctx, chatID);
    if (isInChat) await AsyncUtils.sendAccessGrantedMessage(ctx, chatID);

    const botData = await ctx.api.getChatMember(chatID, ctx.me.id);
    if (!RegularUtils.isBotCanDelete(botData))
        await ctx.api.sendMessage(
            chatID,
            otherMessages.botAdminWhitelistedHint
        );

    await ctx.reply(whiteListMessages.added);
});

export default addWhiteList;
