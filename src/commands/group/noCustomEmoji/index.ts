import { Composer } from 'grammy';

import AsyncUtils from '../../../utils/asyncUtils';
import RedisSingleton from '../../../utils/redisSingleton';
import RegularUtils from '../../../utils/regularUtils';

const noCustomEmoji = new Composer();

noCustomEmoji.command('noemoji', async ctx => {
    const redisInstance = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(redisInstance, 'noemoji');

    if (await AsyncUtils.isCommandIgnored(ctx, redisInstance)) return;

    const chatID = RegularUtils.getChatID(ctx);

    const strictEmojiRemoval =
        (await redisInstance.getHashData(chatID, 'strictEmojiRemoval')) || null;
    const strictEmojiRemovalBoolean =
        strictEmojiRemoval === null
            ? false
            : RegularUtils.getBoolean(strictEmojiRemoval);
    const newStrictEmojiRemovalBoolean = !strictEmojiRemovalBoolean;

    if (!newStrictEmojiRemovalBoolean)
        await redisInstance.deleteHashData(chatID, ['strictEmojiRemoval']);
    else
        await redisInstance.setHashData(chatID, [
            'strictEmojiRemoval',
            String(newStrictEmojiRemovalBoolean)
        ]);

    await ctx.reply(
        newStrictEmojiRemovalBoolean
            ? 'Теперь я буду удалять все кастомные эмодзи'
            : 'Теперь я не буду удалять все кастомные эмодзи',
        {
            reply_to_message_id: RegularUtils.getMessageID(ctx.update.message)
        }
    );
});

export default noCustomEmoji;
