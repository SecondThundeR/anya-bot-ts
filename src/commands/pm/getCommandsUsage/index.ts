import { Composer } from 'grammy';

import AsyncUtils from '../../../utils/asyncUtils';
import RedisSingleton from '../../../utils/redisSingleton';
import RegularUtils from '../../../utils/regularUtils';

const getCommandsUsage = new Composer();

getCommandsUsage.command('getcommandsusage', async ctx => {
    if (!RegularUtils.isBotCreator(ctx)) return;

    const data = await AsyncUtils.getCommandsUsage(
        RedisSingleton.getInstance()
    );
    if (Object.keys(data).length === 0)
        return await ctx.reply('Нет данных по использованию команд');

    let formattedData = '';
    Object.entries(data).forEach(([key, value]) => {
        formattedData += `${key}: ${value} раз(а)\n`;
    });

    await ctx.reply('Данные по использованию команд:\n' + formattedData);
});

export default getCommandsUsage;