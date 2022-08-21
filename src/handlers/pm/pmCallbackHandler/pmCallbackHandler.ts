import { Composer } from 'grammy';
import RegularUtils from '../../../utils/regularUtils';
import otherMessages from '../../../locale/otherMessages';
import { ChatMember, Message, Update } from 'grammy/types';
import keyboardMessages from '../../../locale/keyboardMessages';
import AsyncUtils from '../../../utils/asyncUtils';
import RedisSingleton from '../../../utils/redisSingleton';
import ListsNames from '../../../enums/listsNames';

const pmCallbackHandler = new Composer();

pmCallbackHandler.on('callback_query:data', async ctx => {
    const splitData = RegularUtils.getCallbackData(ctx).split('|');
    const redisInstance = RedisSingleton.getInstance();
    const whiteListIDs = await redisInstance.getAllList(ListsNames.WHITELIST);
    const ignoreListIDs = await redisInstance.getAllList(ListsNames.IGNORELIST);

    if (splitData.length !== 2)
        return await ctx.answerCallbackQuery({
            text: otherMessages.callbackFailure
        });

    const originalMessage = <Update.Edited & Message>(
        await ctx.editMessageReplyMarkup({
            reply_markup: undefined
        })
    );
    const [chatID, listMode] = splitData;
    const whiteListAccept = listMode === 'accept';
    const ignoreListIgnore = listMode === 'ignore';
    let botData: ChatMember | undefined = undefined;

    try {
        botData = await ctx.api.getChatMember(chatID, ctx.me.id);
    } catch (e) {
        return await ctx.reply(keyboardMessages.keyboardError, {
            reply_to_message_id: RegularUtils.getMessageID(originalMessage)
        });
    }

    if (ignoreListIgnore && !RegularUtils.isItemInList(chatID, ignoreListIDs)) {
        await RedisSingleton.getInstance().pushValueToList(
            ListsNames.IGNORELIST,
            String(chatID)
        );
        await AsyncUtils.sendIgnoredMessage(ctx, chatID);
    }

    if (whiteListAccept && !RegularUtils.isItemInList(chatID, whiteListIDs)) {
        await RedisSingleton.getInstance().pushValueToList(
            ListsNames.WHITELIST,
            String(chatID)
        );
        await AsyncUtils.sendAccessGrantedMessage(ctx, chatID);
    }

    if (botData && !RegularUtils.isBotCanDelete(botData))
        await ctx.api.sendMessage(
            chatID,
            otherMessages.botAdminWhitelistedHint
        );

    await ctx.answerCallbackQuery({
        text: otherMessages.callbackSuccess
    });

    await ctx.reply(
        RegularUtils.getWhiteListResponseLocale(
            whiteListAccept,
            ignoreListIgnore
        ),
        {
            reply_to_message_id: RegularUtils.getMessageID(originalMessage)
        }
    );
});

export default pmCallbackHandler;
