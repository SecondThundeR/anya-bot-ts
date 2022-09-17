import {Composer} from 'grammy';
import RedisSingleton from '../../../utils/redisSingleton';
import RegularUtils from '../../../utils/regularUtils';
import AsyncUtils from '../../../utils/asyncUtils';

const noCustomEmoji = new Composer();

noCustomEmoji.command('noemoji', async ctx => {
    const redisSingleton = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(
        redisSingleton,
        'noemoji'
    );

    const chatID = RegularUtils.getChatID(ctx);

    if (!(await AsyncUtils.isGroupAdmin(ctx))) return;

    const strictEmojiRemoval =
        (await redisSingleton.getHashData(chatID, 'strictEmojiRemoval')) ||
        null;
    const strictEmojiRemovalBoolean =
        strictEmojiRemoval === null
            ? false
            : RegularUtils.getBoolean(strictEmojiRemoval);
    const newStrictEmojiRemovalBoolean = !strictEmojiRemovalBoolean;

    if (!newStrictEmojiRemovalBoolean)
        await redisSingleton.deleteHashData(chatID, ['strictEmojiRemoval']);
    else
        await redisSingleton.setHashData(chatID, [
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
