import { Composer } from 'grammy';
import otherMessages from '../../../locale/otherMessages';
import RegularUtils from '../../../utils/regularUtils';

const startMessage = new Composer();

/**
 * This command is used to set start message for bot
 * When command triggered by non-creator user, bot will send dummy placeholder.
 * Otherwise, send note to use /help for more info
 */
startMessage.command('start', async ctx => {
    if (!RegularUtils.isBotCreator(ctx))
        return await ctx.reply(otherMessages.noPMHint);
    await ctx.reply(otherMessages.creatorPMHint);
});

export default startMessage;
