import { Composer } from 'grammy';

import aidenPierceMessages from '../../../locale/aidenPierceMessages';
import AsyncUtils from '../../../utils/asyncUtils';
import RedisSingleton from '../../../utils/redisSingleton';
import RegularUtils from '../../../utils/regularUtils';

const voiceAndVideoHandler = new Composer();

voiceAndVideoHandler.on(['message:voice', 'message:video_note'], async ctx => {
    const redisInstance = RedisSingleton.getInstance();
    const chatID = RegularUtils.getChatID(ctx);
    const isAdminPowerEnabled = await redisInstance.getHashData(
        chatID,
        'adminPower',
        'false'
    );

    const [aidenPierceMode, aidenPierceSilent] =
        await redisInstance.getHashMultipleData(chatID, [
            'aidenMode',
            'isAidenSilent'
        ]);

    if (
        !RegularUtils.getBoolean(aidenPierceMode || 'false') ||
        RegularUtils.getBoolean(aidenPierceSilent || 'false') ||
        ((await AsyncUtils.isGroupAdmin(ctx)) &&
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
