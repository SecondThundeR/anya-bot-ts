import { Composer } from 'grammy';

import AsyncUtils from '@utils/asyncUtils';
import RedisSingleton from '@utils/redisSingleton';
import RegularUtils from '@utils/regularUtils';

import otherMessages from '../../../locale/otherMessages';
import silentMessages from '../../../locale/silentMessages';

const silentOnLocale = new Composer();

silentOnLocale.command('silentonlocale', async ctx => {
    const redisInstance = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(
        redisInstance,
        'silentonlocale'
    );

    if (await AsyncUtils.isCommandIgnored(ctx, redisInstance)) return;

    const [chatID, _, newLocaleString] = await AsyncUtils.extractContextData(
        ctx
    );

    if (RegularUtils.isStringEmpty(newLocaleString))
        return await ctx.reply(otherMessages.stringIsEmpty);

    await redisInstance.setHashData(chatID, [
        'silentOnLocale',
        newLocaleString
    ]);

    await ctx.reply(silentMessages.enabledMessageChange);
});

export default silentOnLocale;
