import { Composer } from 'grammy';

import helpMessages from '../../../locale/helpMessages';
import AsyncUtils from '../../../utils/asyncUtils';
import RedisSingleton from '../../../utils/redisSingleton';
import RegularUtils from '../../../utils/regularUtils';
import { isHelpIgnored } from './helpers';

const helpGroupMessage = new Composer();

helpGroupMessage.command('help', async ctx => {
    const redisInstance = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(redisInstance, 'help');

    if (await isHelpIgnored(ctx, redisInstance)) return;

    await ctx.reply(
        RegularUtils.convertHelpMessageToHTMLFormat(helpMessages.groupMessage),
        {
            parse_mode: 'HTML'
        }
    );
});

export default helpGroupMessage;
