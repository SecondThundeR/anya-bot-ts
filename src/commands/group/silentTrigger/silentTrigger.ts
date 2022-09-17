import RegularUtils from '../../../utils/regularUtils';
import AsyncUtils from '../../../utils/asyncUtils';
import RedisSingleton from '../../../utils/redisSingleton';
import ListsNames from '../../../enums/listsNames';
import {Composer} from 'grammy';
import {updateSilentData} from './helpers';

const silentTrigger = new Composer();

silentTrigger.command('silent', async ctx => {
    const redisSingleton = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(
        redisSingleton,
        'silent'
    );

    const whiteListIDs = await redisSingleton.getList(ListsNames.WHITELIST);
    const chatID = RegularUtils.getChatID(ctx);

    if (
        !RegularUtils.isItemInList(chatID, whiteListIDs) ||
        !(await AsyncUtils.isGroupAdmin(ctx))
    )
        return;

    const replyText = await updateSilentData(redisSingleton, chatID);
    await ctx.reply(replyText, {
        reply_to_message_id: RegularUtils.getMessageID(ctx.update.message)
    });
});

export default silentTrigger;
