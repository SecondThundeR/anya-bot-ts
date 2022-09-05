import { Composer } from 'grammy';
import RegularUtils from '../../../utils/regularUtils';
import ignoreListMessages from '../../../locale/ignoreListMessages';
import ListsNames from '../../../enums/listsNames';
import RedisSingleton from '../../../utils/redisSingleton';

const getIgnoreList = new Composer();

getIgnoreList.command('getignorelist', async ctx => {
    const redisInstance = RedisSingleton.getInstance();
    const ignoreListIDs = await redisInstance.getList(ListsNames.IGNORELIST);

    if (!RegularUtils.isBotCreator(ctx)) return;

    if (ignoreListIDs.length === 0)
        return await ctx.reply(ignoreListMessages.listEmpty);

    await ctx.reply(`${ignoreListMessages.idsInfo}${ignoreListIDs.join('\n')}`);
});

export default getIgnoreList;
