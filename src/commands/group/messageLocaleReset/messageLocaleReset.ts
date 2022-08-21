import { Composer } from 'grammy';
import AsyncUtils from '../../../utils/asyncUtils';
import RedisSingleton from '../../../utils/redisSingleton';
import ListsNames from '../../../enums/listsNames';
import stickerMessages from '../../../locale/stickerMessages';

const messageLocaleReset = new Composer();

messageLocaleReset.command('silentonlocalereset', async ctx => {
    const redisSingleton = RedisSingleton.getInstance();
    const whiteListIDs = await RedisSingleton.getInstance().getAllList(
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
