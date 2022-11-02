import { Composer } from 'grammy';

import AsyncUtils from '@utils/asyncUtils';
import RedisSingleton from '@utils/redisSingleton';
import RegularUtils from '@utils/regularUtils';

import otherMessages from '../../../locale/otherMessages';
import stickerMessages from '../../../locale/stickerMessages';
import {
    deleteLocaleChangingStatus,
    getLocaleChangingStatus,
    setLocaleChangingStatus
} from './helpers';

const messageLocale = new Composer();
const messageLocaleWaitTime = 10;

messageLocale.command('messagelocale', async ctx => {
    const redisInstance = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(
        redisInstance,
        'messagelocale'
    );

    if (await AsyncUtils.isCommandIgnored(ctx, redisInstance)) return;

    const [chatID, _, newLocaleString] = await AsyncUtils.extractContextData(
        ctx
    );
    const messageLocaleChangeStatus = RegularUtils.getBoolean(
        await getLocaleChangingStatus(redisInstance, chatID)
    );

    if (messageLocaleChangeStatus)
        return await ctx.reply(stickerMessages.inProgress, {
            reply_to_message_id: RegularUtils.getMessageID(ctx.update.message)
        });

    await setLocaleChangingStatus(redisInstance, chatID);

    if (RegularUtils.isStringEmpty(newLocaleString))
        return await ctx.reply(otherMessages.stringIsEmpty);

    const userID = RegularUtils.getUserID(ctx);
    const keyboard = RegularUtils.getStickerMessageKeyboard(userID, chatID);

    const message = await ctx.reply(stickerMessages.mentionQuestion, {
        reply_markup: keyboard
    });

    await redisInstance.setHashData(chatID, [
        'stickerMessageLocale',
        newLocaleString
    ]);

    let messageExists = true;

    await AsyncUtils.asyncTimeout(messageLocaleWaitTime * 1000);
    await ctx.api
        .deleteMessage(chatID, message.message_id)
        .then()
        .catch(_ => (messageExists = false));

    await deleteLocaleChangingStatus(redisInstance, chatID);

    if (messageExists) {
        await redisInstance.deleteHashData(chatID, [
            'stickerMessageLocale',
            'stickerMessageMention'
        ]);
        return await ctx.reply(stickerMessages.timeoutError, {
            reply_to_message_id: RegularUtils.getMessageID(ctx.update.message)
        });
    }
});

export default messageLocale;
