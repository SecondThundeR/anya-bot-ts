import { Composer } from 'grammy';

import ListsNames from '../../../enums/listsNames';
import whiteListMessages from '../../../locale/whiteListMessages';
import AsyncUtils from '../../../utils/asyncUtils';
import RedisSingleton from '../../../utils/redisSingleton';
import RegularUtils from '../../../utils/regularUtils';

const getWhiteList = new Composer();

getWhiteList.command('getwhitelist', async ctx => {
    const whiteListIDs = await RedisSingleton.getInstance().getList(
        ListsNames.WHITELIST
    );

    if (!RegularUtils.isBotCreator(ctx)) return;

    if (whiteListIDs.length === 0)
        return await ctx.reply(whiteListMessages.chatsAndIdsListEmpty);

    const [chats, ids] = await AsyncUtils.getChatsByIDs(ctx, whiteListIDs);
    const chatList = RegularUtils.getListOfChats(chats);
    const messageData: string[] = [];

    if (chats.length > 0)
        messageData.push(
            `${whiteListMessages.chatsListHeader}${chatList.join('\n')}`
        );

    if (ids.length > 0)
        messageData.push(
            `${whiteListMessages.idsListHeader}${ids
                .map(id => {
                    return `<code>${id}</code>`;
                })
                .join('\n')}`
        );

    await ctx.reply(messageData.join('\n\n'), {
        parse_mode: 'HTML'
    });
});

export default getWhiteList;
