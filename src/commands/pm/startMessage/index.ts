import { Composer } from 'grammy';

import RegularUtils from '@utils/regularUtils';

import otherMessages from '../../../locale/otherMessages';

const startMessage = new Composer();

startMessage.command('start', async ctx => {
    if (!RegularUtils.isBotCreator(ctx))
        return await ctx.reply(otherMessages.noPMHint);
    await ctx.reply(otherMessages.creatorPMHint);
});

export default startMessage;
