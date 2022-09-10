import { Composer } from 'grammy';
import { getUptimeMessage } from './helpers';
import RegularUtils from '../../../utils/regularUtils';

const uptimeMessage = new Composer();

uptimeMessage.command('uptime', async ctx => {
    if (!RegularUtils.isBotCreator(ctx)) return;
    await ctx.reply(getUptimeMessage(), {
        parse_mode: 'HTML'
    });
});

export default uptimeMessage;
