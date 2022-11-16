import { Composer } from '@/deps.ts';

import AsyncUtils from '@/utils/asyncUtils.ts';
import RedisSingleton from '@/utils/redisSingleton.ts';
import RegularUtils from '@/utils/regularUtils.ts';

import { updateAllowData } from './helpers.ts';

const adminPowerTrigger = new Composer();

adminPowerTrigger.command('adminpower', async (ctx) => {
    const redisInstance = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(redisInstance, 'adminpower');

    if (await AsyncUtils.isCommandIgnored(ctx, redisInstance)) return;

    const replyText = await updateAllowData(
        redisInstance,
        RegularUtils.getChatID(ctx),
    );
    await ctx.reply(replyText, {
        reply_to_message_id: RegularUtils.getMessageID(ctx.update.message),
    });
});

export default adminPowerTrigger;
