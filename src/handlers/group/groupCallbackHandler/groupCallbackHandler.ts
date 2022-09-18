import { Composer } from 'grammy';

import otherMessages from '../../../locale/otherMessages';
import stickerMessages from '../../../locale/stickerMessages';
import RedisSingleton from '../../../utils/redisSingleton';
import RegularUtils from '../../../utils/regularUtils';
import { deleteLocaleChangingStatus } from './helpers';

const groupCallbackHandler = new Composer();

groupCallbackHandler.on('callback_query:data', async ctx => {
    const redisSingleton = RedisSingleton.getInstance();
    const splitData = RegularUtils.getCallbackData(ctx).split('|');

    if (splitData.length !== 3)
        return await ctx.answerCallbackQuery({
            text: otherMessages.callbackFailure
        });

    const [userID, chatID, mentionMode] = splitData;
    const clickUserID = ctx.update.callback_query.from.id;

    if (userID != String(clickUserID))
        return await ctx.answerCallbackQuery({
            text: otherMessages.callbackWrongUser
        });

    await deleteLocaleChangingStatus(redisSingleton, chatID);

    const botData = await ctx.api.getChatMember(chatID, ctx.me.id);
    if (RegularUtils.isBotCanDelete(botData)) await ctx.deleteMessage();

    const mentionModeBoolean = mentionMode === 'yes';

    await redisSingleton.setHashData(chatID, [
        'stickerMessageMention',
        String(mentionModeBoolean)
    ]);

    await ctx.answerCallbackQuery();

    await ctx.reply(
        `${stickerMessages.messageWithMentionChanged} ${
            stickerMessages[
                mentionModeBoolean ? 'mentionModeYes' : 'mentionModeNo'
            ]
        }`
    );
});

export default groupCallbackHandler;
