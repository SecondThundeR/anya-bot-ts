import { Composer } from 'grammy';
import AsyncUtils from '../../../utils/asyncUtils';
import silentMessages from '../../../locale/silentMessages';
import RedisSingleton from '../../../utils/redisSingleton';
import ListsNames from '../../../enums/listsNames';

const silentOffLocaleReset = new Composer();

silentOffLocaleReset.command('silentonlocalereset', async ctx => {
    const redisSingleton = RedisSingleton.getInstance();
    const whiteListIDs = await RedisSingleton.getInstance().getList(
        ListsNames.WHITELIST
    );

    await AsyncUtils.resetLocaleHandler(
        ctx,
        redisSingleton,
        whiteListIDs,
        ['silentOffLocale'],
        silentMessages.disabledMessageReset
    );
});

export default silentOffLocaleReset;
