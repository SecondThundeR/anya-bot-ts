import { Composer } from 'grammy';

import otherMessages from '@locale/otherMessages';
import silentMessages from '@locale/silentMessages';

import AsyncUtils from '@utils/asyncUtils';
import RedisSingleton from '@utils/redisSingleton';
import RegularUtils from '@utils/regularUtils';

const silentOffLocale = new Composer();

silentOffLocale.command('silentofflocale', async ctx => {
    const redisInstance = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(
        redisInstance,
        'silentofflocale'
    );

    if (await AsyncUtils.isCommandIgnored(ctx, redisInstance)) return;

    const [chatID, _, newLocaleString] = await AsyncUtils.extractContextData(
        ctx
    );

    if (RegularUtils.isStringEmpty(newLocaleString))
        return await ctx.reply(otherMessages.stringIsEmpty);

    await redisInstance.setHashData(chatID, {
        silentOffLocale: newLocaleString
    });

    await ctx.reply(silentMessages.disabledMessageChange);
});

export default silentOffLocale;
