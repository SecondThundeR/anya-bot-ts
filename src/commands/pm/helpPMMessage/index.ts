import { Composer } from '@/deps.ts';

import helpMessages from '@/locale/helpMessages.ts';

import RegularUtils from '@/utils/regularUtils.ts';

const helpPMMessage = new Composer();

helpPMMessage.command('help', async (ctx) => {
    if (RegularUtils.isBotCreator(ctx)) {
        return await ctx.reply(
            RegularUtils.convertHelpMessageToHTMLFormat(helpMessages.pmMessage),
            {
                parse_mode: 'HTML',
            },
        );
    }
});

export default helpPMMessage;
