import RegularUtils from '../../../utils/regularUtils';
import AsyncUtils from '../../../utils/asyncUtils';
import { Composer } from 'grammy';
import RedisSingleton from '../../../utils/redisSingleton';
import { updateAidenSilentData } from './helpers';

const aidenSilentTrigger = new Composer();

aidenSilentTrigger.command('aidenSilent', async ctx => {
    const redisSingleton = RedisSingleton.getInstance();
    const chatID = RegularUtils.getChatID(ctx);
    const authorStatus = await AsyncUtils.getAuthorStatus(ctx);

    if (!RegularUtils.isGroupAdmin(authorStatus)) return;

    const replyText = await updateAidenSilentData(redisSingleton, chatID);

    await ctx.reply(replyText, {
        reply_to_message_id: RegularUtils.getMessageID(ctx.update.message)
    });
});

export default aidenSilentTrigger;
