import { Composer } from 'grammy';
import RegularUtils from '../../../utils/regularUtils';
import helpMessages from '../../../locale/helpMessages';

const helpPMMessage = new Composer();

helpPMMessage.command('help', async ctx => {
    const creatorID = process.env.CREATOR_ID;
    if (RegularUtils.isBotCreator(RegularUtils.getUserID(ctx), creatorID))
        return await ctx.reply(helpMessages.creatorMessage);
});

export default helpPMMessage;
