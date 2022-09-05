import { Composer } from 'grammy';
import RegularUtils from '../../../utils/regularUtils';
import helpMessages from '../../../locale/helpMessages';

const helpPMMessage = new Composer();

helpPMMessage.command('help', async ctx => {
    if (RegularUtils.isBotCreator(ctx))
        return await ctx.reply(
            RegularUtils.convertHelpMessageToHTMLFormat(helpMessages.pmMessage),
            {
                parse_mode: 'HTML'
            }
        );
});

export default helpPMMessage;
