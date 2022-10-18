import { Composer } from 'grammy';

import AsyncUtils from '../../../utils/asyncUtils';
import RedisSingleton from '../../../utils/redisSingleton';
import RegularUtils from '../../../utils/regularUtils';
import { updateAidenData } from './helpers';

const aidenMode = new Composer();

aidenMode.command('aidenmode', async ctx => {
    const redisInstance = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(redisInstance, 'aidenmode');

    if (await AsyncUtils.isCommandIgnored(ctx, redisInstance)) return;

    await ctx.reply(await updateAidenData(ctx), {
        reply_to_message_id: RegularUtils.getMessageID(ctx.update.message)
    });
});

export default aidenMode;
