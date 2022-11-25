import { Composer } from 'grammy';

import diceGameMessages from '@locale/diceGameMessages';

import AsyncUtils from '@utils/asyncUtils';
import RedisSingleton from '@utils/redisSingleton';
import RegularUtils from '@utils/regularUtils';

const diceGame = new Composer();

diceGame.command('dice', async ctx => {
    const redisInstance = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(redisInstance, 'dice');

    if (!(await AsyncUtils.isChatWhitelisted(ctx, redisInstance))) return;

    const diceText = ctx.match;
    const diceData = diceText.split(' ');

    if (diceText === '')
        return await ctx.reply(diceGameMessages.empty, {
            reply_to_message_id: RegularUtils.getMessageID(ctx.update.message)
        });

    if (diceData.length === 1)
        return await ctx.reply(diceGameMessages.noTextProvided, {
            reply_to_message_id: RegularUtils.getMessageID(ctx.update.message)
        });

    const gameData = {
        number: diceData[0],
        text: diceData.slice(1).join(' ')
    };

    if (isNaN(Number(gameData.number))) {
        return await ctx.reply(diceGameMessages.notANumber, {
            reply_to_message_id: RegularUtils.getMessageID(ctx.update.message)
        });
    }

    const finalMessage = RegularUtils.setPlaceholderData(
        diceGameMessages.message,
        gameData
    );

    await ctx.reply(finalMessage, {
        reply_to_message_id: RegularUtils.getMessageID(ctx.update.message)
    });
    await ctx.replyWithDice(diceGameMessages.diceEmoji, {
        reply_to_message_id: RegularUtils.getMessageID(ctx.update.message)
    });
});

export default diceGame;
