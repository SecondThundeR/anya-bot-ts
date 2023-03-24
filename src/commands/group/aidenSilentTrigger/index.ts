import { Composer } from '@/deps.ts';

import AsyncUtils from '@/utils/asyncUtils.ts';
import RedisSingleton from '@/utils/redisSingleton.ts';
import RegularUtils from '@/utils/regularUtils.ts';

import { updateAidenSilentData } from '@/groupCommands/aidenSilentTrigger/helpers.ts';

const aidenSilentTrigger = new Composer();

aidenSilentTrigger.command('aidensilent', async (ctx) => {
    const redisInstance = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(redisInstance, 'aidensilent');

    if (await AsyncUtils.isCommandIgnored(ctx, redisInstance)) return;

    const replyText = await updateAidenSilentData(
        redisInstance,
        RegularUtils.getChatID(ctx),
    );
    await ctx.reply(replyText, {
        reply_to_message_id: RegularUtils.getMessageID(ctx.update.message),
    });
});

export default aidenSilentTrigger;
