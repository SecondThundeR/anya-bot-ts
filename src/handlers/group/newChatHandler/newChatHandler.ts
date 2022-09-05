import { Composer } from 'grammy';
import RegularUtils from '../../../utils/regularUtils';
import AsyncUtils from '../../../utils/asyncUtils';
import otherMessages from '../../../locale/otherMessages';
import RedisSingleton from '../../../utils/redisSingleton';
import ListsNames from '../../../enums/listsNames';

const newChatHandler = new Composer();

newChatHandler.on('msg:new_chat_members:me', async ctx => {
    const creatorID = process.env.CREATOR_ID;
    const redisInstance = RedisSingleton.getInstance();
    const chatID = RegularUtils.getChatID(ctx);
    const idsLists = await redisInstance.getLists([
        ListsNames.WHITELIST,
        ListsNames.IGNORELIST
    ]);

    if (!RegularUtils.isItemInList(chatID, idsLists[ListsNames.WHITELIST]))
        return await AsyncUtils.newChatJoinHandler(
            ctx,
            creatorID,
            RegularUtils.isItemInList(chatID, idsLists[ListsNames.IGNORELIST])
        );

    return await ctx.reply(otherMessages.botAdminHint);
});

export default newChatHandler;
