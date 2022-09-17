import {Composer} from 'grammy';
import AsyncUtils from '../../../utils/asyncUtils';
import silentMessages from '../../../locale/silentMessages';
import RedisSingleton from '../../../utils/redisSingleton';
import ListsNames from '../../../enums/listsNames';

const silentOnLocaleReset = new Composer();

silentOnLocaleReset.command('silentonlocalereset', async ctx => {
    const redisSingleton = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(
        redisSingleton,
        'silentonlocalereset'
    );

    const whiteListIDs = await RedisSingleton.getInstance().getList(
        ListsNames.WHITELIST
    );

    await AsyncUtils.resetLocaleHandler(
        ctx,
        redisSingleton,
        whiteListIDs,
        ['silentOnLocale'],
        silentMessages.enabledMessageReset
    );
});

export default silentOnLocaleReset;
