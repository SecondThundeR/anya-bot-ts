import { Composer } from 'grammy';
import RedisSingleton from '../../../utils/redisSingleton';
import ListsNames from '../../../enums/listsNames';
import RegularUtils from '../../../utils/regularUtils';
import AsyncUtils from '../../../utils/asyncUtils';
import { updateAllowData } from './helpers';

const adminPowerTrigger = new Composer();

adminPowerTrigger.command('adminpower', async ctx => {
    const redisInstance = RedisSingleton.getInstance();
    const whiteListIDs = await redisInstance.getList(ListsNames.WHITELIST);
    const chatID = RegularUtils.getChatID(ctx);
    const authorStatus = await AsyncUtils.getAuthorStatus(ctx);

    if (
        !RegularUtils.isItemInList(chatID, whiteListIDs) ||
        !RegularUtils.isGroupAdmin(authorStatus)
    )
        return;

    const replyText = await updateAllowData(redisInstance, chatID);
    await ctx.reply(replyText, {
        reply_to_message_id: RegularUtils.getMessageID(ctx.update.message)
    });
});

export default adminPowerTrigger;
