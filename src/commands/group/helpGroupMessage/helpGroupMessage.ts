import {Composer} from 'grammy';
import RegularUtils from '../../../utils/regularUtils';
import AsyncUtils from '../../../utils/asyncUtils';
import helpMessages from '../../../locale/helpMessages';
import ListsNames from '../../../enums/listsNames';
import RedisSingleton from '../../../utils/redisSingleton';
import {sendNoAccessMessage} from './helpers';

const helpGroupMessage = new Composer();

helpGroupMessage.command('help', async ctx => {
    await AsyncUtils.incrementCommandUsageCounter(
        RedisSingleton.getInstance(),
        'help'
    );

    const whiteListIDs = await RedisSingleton.getInstance().getList(
        ListsNames.WHITELIST
    );
    const chatID = RegularUtils.getChatID(ctx);

    if (!RegularUtils.isItemInList(chatID, whiteListIDs))
        return await sendNoAccessMessage(ctx, chatID);

    if (!(await AsyncUtils.isGroupAdmin(ctx)))
        return await ctx.reply(helpMessages.noAccessMessage);

    await ctx.reply(
        RegularUtils.convertHelpMessageToHTMLFormat(helpMessages.groupMessage),
        {
            parse_mode: 'HTML'
        }
    );
});

export default helpGroupMessage;
