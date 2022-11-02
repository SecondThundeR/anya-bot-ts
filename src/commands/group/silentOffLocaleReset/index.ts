import { Composer } from 'grammy';

import ListsNames from '@enums/listsNames';

import silentMessages from '@locale/silentMessages';

import AsyncUtils from '@utils/asyncUtils';
import RedisSingleton from '@utils/redisSingleton';

const silentOffLocaleReset = new Composer();

silentOffLocaleReset.command('silentofflocalereset', async ctx => {
    const redisInstance = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(
        redisInstance,
        'silentofflocalereset'
    );

    if (await AsyncUtils.isCommandIgnored(ctx, redisInstance)) return;

    const whiteListIDs = await redisInstance.getList(ListsNames.WHITELIST);

    await AsyncUtils.resetLocaleHandler(
        ctx,
        redisInstance,
        whiteListIDs,
        ['silentOffLocale'],
        silentMessages.disabledMessageReset
    );
});

export default silentOffLocaleReset;
