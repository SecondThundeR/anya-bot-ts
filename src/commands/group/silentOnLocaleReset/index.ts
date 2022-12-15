import { Composer } from 'grammy';

import ListsNames from '@data/listsNames';

import silentMessages from '@locale/silentMessages';

import AsyncUtils from '@utils/asyncUtils';
import RedisSingleton from '@utils/redisSingleton';

const silentOnLocaleReset = new Composer();

silentOnLocaleReset.command('silentonlocalereset', async ctx => {
    const redisInstance = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(
        redisInstance,
        'silentonlocalereset'
    );

    if (await AsyncUtils.isCommandIgnored(ctx, redisInstance)) return;

    const whiteListIDs = await redisInstance.getList(ListsNames.WHITELIST);

    await AsyncUtils.resetLocaleHandler(
        ctx,
        redisInstance,
        whiteListIDs,
        ['silentOnLocale'],
        silentMessages.enabledMessageReset
    );
});

export default silentOnLocaleReset;
