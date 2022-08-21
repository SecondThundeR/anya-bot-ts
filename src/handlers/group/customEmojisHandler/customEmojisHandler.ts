import { Composer } from 'grammy';
import RegularUtils from '../../../utils/regularUtils';
import RedisSingleton from '../../../utils/redisSingleton';
import AsyncUtils from '../../../utils/asyncUtils';

const customEmojisHandler = new Composer();

// TODO: Add strict check for custom_emoji when update of Grammy will be available
customEmojisHandler.on(
    ['message:entities', 'edited_message:entities'],
    async ctx => {
        const chatID = RegularUtils.getChatID(ctx);
        const botData = await ctx.getChatMember(ctx.me.id);
        const authorStatus = await AsyncUtils.getAuthorStatus(ctx);
        const isAdminPowerEnabled =
            await RedisSingleton.getInstance().getHashData(
                chatID,
                'adminPower',
                'false'
            );

        if (
            !RegularUtils.isBotCanDelete(botData) ||
            (RegularUtils.isGroupAdmin(authorStatus) &&
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
            ctx?.update?.edited_message?.entities;
        if (entities_array === undefined) return;

        const isCustomEmojiExists = entities_array.some(
            // @ts-ignore Fix on next version of grammY
            entity => entity.type === 'custom_emoji'
        );
        if (isCustomEmojiExists) return await ctx.deleteMessage();
    }
);

export default customEmojisHandler;
