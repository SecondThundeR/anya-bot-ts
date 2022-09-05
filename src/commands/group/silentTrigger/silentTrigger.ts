import RegularUtils from '../../../utils/regularUtils';
import AsyncUtils from '../../../utils/asyncUtils';
import RedisSingleton from '../../../utils/redisSingleton';
import ListsNames from '../../../enums/listsNames';
import { Composer } from 'grammy';
import { updateSilentData } from './helpers';

const silentTrigger = new Composer();

silentTrigger.command('silent', async ctx => {
    const redisSingleton = RedisSingleton.getInstance();
    const whiteListIDs = await redisSingleton.getList(ListsNames.WHITELIST);
    const chatID = RegularUtils.getChatID(ctx);
    const authorStatus = await AsyncUtils.getAuthorStatus(ctx);

    if (
        !RegularUtils.isItemInList(chatID, whiteListIDs) ||
        !RegularUtils.isGroupAdmin(authorStatus)
    )
        return;

    const replyText = await updateSilentData(redisSingleton, chatID);
    await ctx.reply(replyText, {
        reply_to_message_id: RegularUtils.getMessageID(ctx.update.message)
    });
});

export default silentTrigger;
