import { Context } from 'grammy';
import whiteListMessages from '../../../locale/whiteListMessages';

export const sendNoAccessMessage = async (ctx: Context, chatID: number) => {
    return await ctx.reply(
        whiteListMessages.chatMessage.replace(/xxx/i, `<code>${chatID}</code>`),
        {
            parse_mode: 'HTML'
        }
    );
};
