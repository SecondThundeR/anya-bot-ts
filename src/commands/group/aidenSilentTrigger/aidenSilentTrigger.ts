import { Composer } from 'grammy';

import AsyncUtils from '../../../utils/asyncUtils';
import RedisSingleton from '../../../utils/redisSingleton';
import RegularUtils from '../../../utils/regularUtils';
import { updateAidenSilentData } from './helpers';

const aidenSilentTrigger = new Composer();

aidenSilentTrigger.command('aidensilent', async ctx => {
    const redisInstance = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(redisInstance, 'aidensilent');

    if (await AsyncUtils.isCommandIgnored(ctx, redisInstance)) return;

    const replyText = await updateAidenSilentData(
        redisInstance,
        RegularUtils.getChatID(ctx)
    );
    await ctx.reply(replyText, {
        reply_to_message_id: RegularUtils.getMessageID(ctx.update.message)
    });
});

export default aidenSilentTrigger;
