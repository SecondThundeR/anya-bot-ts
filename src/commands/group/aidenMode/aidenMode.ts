import RegularUtils from '../../../utils/regularUtils';
import AsyncUtils from '../../../utils/asyncUtils';
import { Composer } from 'grammy';
import { updateAidenData } from './helpers';
import RedisSingleton from '../../../utils/redisSingleton';

const aidenMode = new Composer();

aidenMode.command('aidenmode', async ctx => {
    await AsyncUtils.incrementCommandUsageCounter(
        RedisSingleton.getInstance(),
        'aidenmode'
    );
    if (!(await AsyncUtils.isGroupAdmin(ctx))) return;
    await ctx.reply(await updateAidenData(ctx), {
        reply_to_message_id: RegularUtils.getMessageID(ctx.update.message)
    });
});

export default aidenMode;
