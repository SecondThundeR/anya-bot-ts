import { Composer } from '@/deps.ts';

import AsyncUtils from '@/utils/asyncUtils.ts';
import RedisSingleton from '@/utils/redisSingleton.ts';
import RegularUtils from '@/utils/regularUtils.ts';

import { updateAidenData } from './helpers.ts';

const aidenMode = new Composer();

aidenMode.command('aidenmode', async (ctx) => {
    const redisInstance = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(redisInstance, 'aidenmode');

    if (await AsyncUtils.isCommandIgnored(ctx, redisInstance)) return;

    await ctx.reply(await updateAidenData(ctx), {
        reply_to_message_id: RegularUtils.getMessageID(ctx.update.message),
    });
});

export default aidenMode;
