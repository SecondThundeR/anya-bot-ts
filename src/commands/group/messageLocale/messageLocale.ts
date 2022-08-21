import { Composer } from 'grammy';
import AsyncUtils from '../../../utils/asyncUtils';
import RegularUtils from '../../../utils/regularUtils';
import stickerMessages from '../../../locale/stickerMessages';
import otherMessages from '../../../locale/otherMessages';
import RedisSingleton from '../../../utils/redisSingleton';
import ListsNames from '../../../enums/listsNames';
import {
    deleteLocaleChangingStatus,
    getLocaleChangingStatus,
    setLocaleChangingStatus
} from './helpers';

const messageLocale = new Composer();
const messageLocaleWaitTime = 10;

messageLocale.command('messagelocale', async ctx => {
    const redisSingleton = RedisSingleton.getInstance();
    const [chatID, authorStatus, _, newLocaleString] =
        await AsyncUtils.extractContextData(ctx);
    const whiteListIDs = await RedisSingleton.getInstance().getAllList(
        ListsNames.WHITELIST
    );
    const messageLocaleChangeStatus = RegularUtils.getBoolean(
        await getLocaleChangingStatus(redisSingleton, chatID)
    );

    if (
        !RegularUtils.isItemInList(chatID, whiteListIDs) ||
        !RegularUtils.isGroupAdmin(authorStatus)
    )
        return;

    if (messageLocaleChangeStatus)
        return await ctx.reply(stickerMessages.inProgress, {
            reply_to_message_id: RegularUtils.getMessageID(ctx.update.message)
        });

    await setLocaleChangingStatus(redisSingleton, chatID);

    if (RegularUtils.isStringEmpty(newLocaleString))
        return await ctx.reply(otherMessages.stringIsEmpty);

    const userID = RegularUtils.getUserID(ctx);
    const keyboard = RegularUtils.getStickerMessageKeyboard(userID, chatID);

    const message = await ctx.reply(stickerMessages.mentionQuestion, {
        reply_markup: keyboard
    });

    await redisSingleton.setHashData(chatID, [
        'stickerMessageLocale',
        newLocaleString
    ]);

    let messageExists = true;

    await AsyncUtils.asyncTimeout(messageLocaleWaitTime * 1000);
    await ctx.api
        .deleteMessage(chatID, message.message_id)
        .then()
        .catch(_ => (messageExists = false));

    await deleteLocaleChangingStatus(redisSingleton, chatID);

    if (messageExists) {
        await redisSingleton.deleteHashData(chatID, [
            'stickerMessageLocale',
            'stickerMessageMention'
        ]);
        return await ctx.reply(stickerMessages.timeoutError, {
            reply_to_message_id: RegularUtils.getMessageID(ctx.update.message)
        });
    }
});

export default messageLocale;
