import { Composer } from 'grammy';
import otherMessages from '../../../locale/otherMessages';

const startMessage = new Composer();

startMessage.command(
    'start',
    async ctx => await ctx.reply(otherMessages.noPMHint)
);

export default startMessage;
