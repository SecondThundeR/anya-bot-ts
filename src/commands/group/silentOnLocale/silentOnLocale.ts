import {Composer} from 'grammy';
import AsyncUtils from '../../../utils/asyncUtils';
import RegularUtils from '../../../utils/regularUtils';
import otherMessages from '../../../locale/otherMessages';
import silentMessages from '../../../locale/silentMessages';
import RedisSingleton from '../../../utils/redisSingleton';
import ListsNames from '../../../enums/listsNames';

const silentOnLocale = new Composer();

silentOnLocale.command('silentonlocale', async ctx => {
    const redisSingleton = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(
        redisSingleton,
        'silentonlocale'
    );

    const [chatID, _, newLocaleString] = await AsyncUtils.extractContextData(
        ctx
    );
    const whiteListIDs = await RedisSingleton.getInstance().getList(
        ListsNames.WHITELIST
    );

    if (
        !RegularUtils.isItemInList(chatID, whiteListIDs) ||
        !(await AsyncUtils.isGroupAdmin(ctx))
    )
        return;

    if (RegularUtils.isStringEmpty(newLocaleString))
        return await ctx.reply(otherMessages.stringIsEmpty);

    await redisSingleton.setHashData(chatID, [
        'silentOnLocale',
        newLocaleString
    ]);

    await ctx.reply(silentMessages.enabledMessageChange);
});

export default silentOnLocale;
