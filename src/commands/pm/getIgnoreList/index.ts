import { Composer } from 'grammy';

import RedisSingleton from '@utils/redisSingleton';
import RegularUtils from '@utils/regularUtils';

import ListsNames from '../../../enums/listsNames';
import ignoreListMessages from '../../../locale/ignoreListMessages';

const getIgnoreList = new Composer();

getIgnoreList.command('getignorelist', async ctx => {
    const redisInstance = RedisSingleton.getInstance();
    const ignoreListIDs = await redisInstance.getList(ListsNames.IGNORELIST);

    if (!RegularUtils.isBotCreator(ctx)) return;

    if (ignoreListIDs.length === 0)
        return await ctx.reply(ignoreListMessages.idsListEmpty);

    await ctx.reply(
        `${ignoreListMessages.idsListHeader}${ignoreListIDs.join('\n')}`
    );
});

export default getIgnoreList;
