import RegularUtils from '../../../utils/regularUtils';
import AsyncUtils from '../../../utils/asyncUtils';
import { Composer } from 'grammy';
import RedisSingleton from '../../../utils/redisSingleton';
import { updateAidenData } from './helpers';

const aidenMode = new Composer();

aidenMode.command('aidenmode', async ctx => {
    const redisSingleton = RedisSingleton.getInstance();
    const chatID = RegularUtils.getChatID(ctx);
    const authorStatus = await AsyncUtils.getAuthorStatus(ctx);

    if (!RegularUtils.isGroupAdmin(authorStatus)) return;

    const replyText = await updateAidenData(redisSingleton, chatID);

    await ctx.reply(replyText, {
        reply_to_message_id: RegularUtils.getMessageID(ctx.update.message)
    });
});

export default aidenMode;
