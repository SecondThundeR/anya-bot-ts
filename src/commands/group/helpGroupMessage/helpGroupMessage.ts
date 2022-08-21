import { Composer } from 'grammy';
import RegularUtils from '../../../utils/regularUtils';
import AsyncUtils from '../../../utils/asyncUtils';
import helpMessages from '../../../locale/helpMessages';
import ListsNames from '../../../enums/listsNames';
import RedisSingleton from '../../../utils/redisSingleton';
import { sendNoAccessMessage } from './helpers';

const helpGroupMessage = new Composer();

helpGroupMessage.command('help', async ctx => {
    const whiteListIDs = await RedisSingleton.getInstance().getAllList(
        ListsNames.WHITELIST
    );
    const chatID = RegularUtils.getChatID(ctx);
    const authorStatus = await AsyncUtils.getAuthorStatus(ctx);

    if (!RegularUtils.isItemInList(chatID, whiteListIDs))
        return await sendNoAccessMessage(ctx, chatID);

    if (!RegularUtils.isGroupAdmin(authorStatus))
        return await ctx.reply(helpMessages.regularMessage);

    await ctx.reply(helpMessages.adminMessage);
});

export default helpGroupMessage;
