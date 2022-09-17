import { Composer } from 'grammy';
import AsyncUtils from '../../../utils/asyncUtils';
import RedisSingleton from '../../../utils/redisSingleton';
import ListsNames from '../../../enums/listsNames';
import stickerMessages from '../../../locale/stickerMessages';

const messageLocaleReset = new Composer();

messageLocaleReset.command('messagelocalereset', async ctx => {
    const redisSingleton = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(
        redisSingleton,
        'messagelocalereset'
    );

    const whiteListIDs = await RedisSingleton.getInstance().getList(
        ListsNames.WHITELIST
    );

    await AsyncUtils.resetLocaleHandler(
        ctx,
        redisSingleton,
        whiteListIDs,
        ['stickerMessageLocale', 'stickerMessageMention'],
        stickerMessages.messageReset
    );
});

export default messageLocaleReset;
