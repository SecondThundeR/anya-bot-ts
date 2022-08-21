import { Composer } from 'grammy';
import RegularUtils from '../../../utils/regularUtils';
import AsyncUtils from '../../../utils/asyncUtils';
import RedisSingleton from '../../../utils/redisSingleton';
import ListsNames from '../../../enums/listsNames';

const premiumStickersHandler = new Composer();

premiumStickersHandler.on('message:sticker', async ctx => {
    const redisSingleton = RedisSingleton.getInstance();
    const chatID = RegularUtils.getChatID(ctx);
    const authorStatus = await AsyncUtils.getAuthorStatus(ctx);
    const botData = await ctx.getChatMember(ctx.me.id);
    const whiteListIDs = await redisSingleton.getAllList(ListsNames.WHITELIST);
    const isAdminPowerEnabled = await redisSingleton.getHashData(
        chatID,
        'adminPower',
        'false'
    );

    if (
        !RegularUtils.isItemInList(chatID, whiteListIDs) ||
        !RegularUtils.isPremiumSticker(ctx) ||
        !RegularUtils.isBotCanDelete(botData) ||
        (RegularUtils.isGroupAdmin(authorStatus) &&
            RegularUtils.getBoolean(isAdminPowerEnabled))
    )
        return;

    const deleteStatus = await AsyncUtils.isMessageAlreadyDeleted(ctx);
    if (deleteStatus) return;

    const silentStatus = await redisSingleton.getHashData(
        chatID,
        'isSilent',
        'false'
    );
    if (RegularUtils.getBoolean(silentStatus)) return;

    await ctx.reply(
        await AsyncUtils.generateStickerMessageLocale(
            redisSingleton,
            ctx,
            chatID
        )
    );
});

export default premiumStickersHandler;
