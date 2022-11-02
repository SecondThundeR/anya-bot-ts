import { Composer } from 'grammy';

import AsyncUtils from '@utils/asyncUtils';
import RedisSingleton from '@utils/redisSingleton';
import RegularUtils from '@utils/regularUtils';

const customEmojisHandler = new Composer();

customEmojisHandler.on(
    [
        'message:entities:custom_emoji',
        'edited_message:entities:custom_emoji',
        'message:caption_entities:custom_emoji',
        'edited_message:caption_entities:custom_emoji'
    ],
    async ctx => {
        const chatID = RegularUtils.getChatID(ctx);
        const botData = await ctx.getChatMember(ctx.me.id);
        const isAdminPowerEnabled =
            await RedisSingleton.getInstance().getHashData(
                chatID,
                'adminPower',
                'false'
            );

        if (
            !RegularUtils.isBotCanDelete(botData) ||
            ((await AsyncUtils.isGroupAdmin(ctx)) &&
                RegularUtils.getBoolean(isAdminPowerEnabled))
        )
            return;

        const strictEmojiRemovalRule =
            await RedisSingleton.getInstance().getHashData(
                chatID,
                'strictEmojiRemoval',
                'false'
            );
        if (!RegularUtils.getBoolean(strictEmojiRemovalRule)) return;

        const entities_array =
            ctx?.update?.message?.entities ||
            ctx?.update?.edited_message?.entities ||
            ctx?.update?.message?.caption_entities ||
            ctx?.update?.edited_message?.caption_entities;
        if (entities_array === undefined) return;

        if (entities_array.length > 0) return await ctx.deleteMessage();
    }
);

export default customEmojisHandler;
