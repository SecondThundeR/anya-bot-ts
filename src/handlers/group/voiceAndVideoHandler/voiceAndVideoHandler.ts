import { Composer } from 'grammy';
import RegularUtils from '../../../utils/regularUtils';
import AsyncUtils from '../../../utils/asyncUtils';
import aidenPierceMessages from '../../../locale/aidenPierceMessages';
import RedisSingleton from '../../../utils/redisSingleton';

const voiceAndVideoHandler = new Composer();

voiceAndVideoHandler.on(['message:voice', 'message:video_note'], async ctx => {
    const redisSingleton = RedisSingleton.getInstance();
    const chatID = RegularUtils.getChatID(ctx);
    const authorStatus = await AsyncUtils.getAuthorStatus(ctx);
    const isAdminPowerEnabled = await redisSingleton.getHashData(
        chatID,
        'adminPower',
        'false'
    );

    const [aidenPierceMode, aidenPierceSilent] =
        await redisSingleton.getHashMultipleData(chatID, [
            'aidenMode',
            'isAidenSilent'
        ]);

    if (
        !RegularUtils.getBoolean(aidenPierceMode || 'false') ||
        RegularUtils.getBoolean(aidenPierceSilent || 'false') ||
        (RegularUtils.isGroupAdmin(authorStatus) &&
            RegularUtils.getBoolean(isAdminPowerEnabled))
    )
        return;

    const botData = await ctx.getChatMember(ctx.me.id);
    if (!RegularUtils.isBotCanDelete(botData)) return;

    const deleteStatus = await AsyncUtils.isMessageAlreadyDeleted(ctx);
    if (deleteStatus) return;

    const randomMessage =
        aidenPierceMessages.quotesArray[
            Math.floor(Math.random() * aidenPierceMessages.quotesArray.length)
        ];
    const userMention = RegularUtils.getUserMention(ctx.update.message?.from!);

    await ctx.reply(`${userMention}, ${randomMessage}`);
});

export default voiceAndVideoHandler;
