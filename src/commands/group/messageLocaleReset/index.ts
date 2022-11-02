import { Composer } from 'grammy';

import AsyncUtils from '@utils/asyncUtils';
import RedisSingleton from '@utils/redisSingleton';

import ListsNames from '../../../enums/listsNames';
import stickerMessages from '../../../locale/stickerMessages';

const messageLocaleReset = new Composer();

messageLocaleReset.command('messagelocalereset', async ctx => {
    const redisInstance = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(
        redisInstance,
        'messagelocalereset'
    );

    if (await AsyncUtils.isCommandIgnored(ctx, redisInstance)) return;

    const whiteListIDs = await redisInstance.getList(ListsNames.WHITELIST);

    await AsyncUtils.resetLocaleHandler(
        ctx,
        redisInstance,
        whiteListIDs,
        ['stickerMessageLocale', 'stickerMessageMention'],
        stickerMessages.messageReset
    );
});

export default messageLocaleReset;
