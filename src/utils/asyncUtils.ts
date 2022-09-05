import { Api, Context, InlineKeyboard } from 'grammy';
import { ChatFromGetChat, ChatMember } from 'grammy/types';
import RegularUtils from './regularUtils';
import { RedisClientType } from '@redis/client';
import ignoreListMessages from '../locale/ignoreListMessages';
import whiteListMessages from '../locale/whiteListMessages';
import keyboardMessages from '../locale/keyboardMessages';
import RedisSingleton from './redisSingleton';

export default class AsyncUtils {
    /**
     * Gets the name and username of the currently running bot
     * and logs the information to the console
     * @param api - Telegram Bot API instance
     */
    public static async logBotInfo(api: Api) {
        const botBasicInfo = await api.getMe();
        if (botBasicInfo === undefined) return;
        console.log(
            `Started as ${botBasicInfo.first_name} (@${botBasicInfo.username})`
        );
    }

    /**
     * Checks that the bot is in chat
     * @param ctx - Context object
     * @param chatID - ID of chat to check
     * @returns - true if bot is in chat, false if not
     */
    public static async isBotInChat(
        ctx: Context,
        chatID: string | number
    ): Promise<boolean> {
        try {
            await ctx.api.getChat(chatID);
            return true;
        } catch (_) {
            return false;
        }
    }

    public static async isMessageAlreadyDeleted(
        ctx: Context
    ): Promise<boolean> {
        let isMessageDeleted = false;
        await ctx
            .deleteMessage()
            .then()
            .catch(_ => {
                isMessageDeleted = true;
            });
        return isMessageDeleted;
    }

    public static async getAuthorStatus(ctx: Context): Promise<string> {
        const chatID = RegularUtils.getChatID(ctx);
        const authorData = await ctx.getAuthor();
        const isAnonBot = ctx.update.message?.sender_chat?.id === chatID;
        return isAnonBot ? 'anon' : authorData.status;
    }

    public static async getChatsByIDs(
        ctx: Context,
        chatsIDs: string[]
    ): Promise<[ChatFromGetChat[], string[]]> {
        let chatObjectArray: ChatFromGetChat[] = [];
        let chatIDArray: string[] = [];
        await Promise.all(
            chatsIDs.map(async id => {
                await ctx.api
                    .getChat(id)
                    .then(chat => {
                        chatObjectArray.push(chat);
                    })
                    .catch(_ => {
                        chatIDArray.push(id);
                    });
            })
        );
        return [chatObjectArray, chatIDArray];
    }

    public static async extractContextData(
        ctx: Context
    ): Promise<[number, ChatMember, string]> {
        const chatID = RegularUtils.getChatID(ctx);
        const botData = await ctx.getChatMember(ctx.me.id);
        const messageText = String(ctx.match) || '';
        return [chatID, botData, messageText];
    }

    public static async resetLocaleHandler(
        ctx: Context,
        client: RedisSingleton,
        whiteListIDs: string[],
        fieldsArray: string[],
        localeResetMessage: string
    ) {
        const chatID = RegularUtils.getChatID(ctx);
        const botData = await ctx.getChatMember(ctx.me.id);

        if (!RegularUtils.isItemInList(chatID, whiteListIDs)) return;

        if (
            !(await AsyncUtils.isGroupAdmin(ctx)) &&
            RegularUtils.isBotCanDelete(botData)
        )
            return await ctx.deleteMessage();

        await RedisSingleton.getInstance().deleteHashData(chatID, fieldsArray);

        await ctx.reply(localeResetMessage);
    }

    public static async asyncTimeout(ms: number) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

    public static async generateStickerMessageLocale(
        client: RedisSingleton,
        ctx: Context,
        chatID: number | string
    ) {
        const [customText, stickerMessageMention] =
            await RedisSingleton.getInstance().getHashMultipleData(chatID, [
                'stickerMessageLocale',
                'stickerMessageMention'
            ]);
        const [verifiedCustomText, verifiedStickerMessageMentionStatus] =
            RegularUtils.verifyStickerMessageLocale(
                customText,
                stickerMessageMention
            );
        const userMention = RegularUtils.getUserMention(
            ctx.update.message?.from!
        );
        return RegularUtils.getStickerMessageLocale(
            verifiedCustomText,
            verifiedStickerMessageMentionStatus,
            userMention
        );
    }

    public static async isGroupAdmin(ctx: Context): Promise<boolean> {
        const authorStatus = await AsyncUtils.getAuthorStatus(ctx);
        return (
            authorStatus === 'administrator' ||
            authorStatus === 'creator' ||
            authorStatus === 'anon'
        );
    }

    public static async newChatJoinHandler(
        ctx: Context,
        creatorID: string | undefined,
        isIgnored: boolean
    ) {
        const chatID = RegularUtils.getChatID(ctx);

        if (isIgnored) {
            const ignoredMessage = ignoreListMessages.chatMessage.replace(
                /xxx/i,
                `<code>${chatID}</code>`
            );
            await ctx.reply(ignoredMessage, {
                parse_mode: 'HTML'
            });
            return await ctx.leaveChat();
        }

        const whiteListMessage = whiteListMessages.chatMessage.replace(
            /xxx/i,
            `<code>${chatID}</code>`
        );

        await ctx.reply(whiteListMessage, {
            parse_mode: 'HTML'
        });

        if (creatorID === undefined) return;

        const [chatName, chatUsername] = RegularUtils.getChatInfo(ctx);
        const chatLink = RegularUtils.getChatLink(chatUsername);
        const chatLinkMessage = chatLink !== undefined ? chatLink : chatName;
        const userInfo = RegularUtils.getUser(ctx);
        const userMention =
            userInfo !== undefined
                ? RegularUtils.getUserMention(userInfo)
                : undefined;
        const messageText = RegularUtils.getWhiteListLocale(
            userMention,
            `${chatLinkMessage} (<code>${chatID}</code>)`
        );
        const keyboard = new InlineKeyboard()
            .text(keyboardMessages.buttonYes, `${chatID}|accept`)
            .text(keyboardMessages.buttonNo, `${chatID}|deny`)
            .row()
            .text(keyboardMessages.buttonIgnore, `${chatID}|ignore`);

        await ctx.api.sendMessage(Number(creatorID), messageText, {
            reply_markup: keyboard,
            parse_mode: 'HTML'
        });
    }

    public static async sendAccessGrantedMessage(
        ctx: Context,
        chatID: string | number
    ) {
        await ctx.api.sendMessage(chatID, whiteListMessages.accessGranted);
    }

    public static async sendAccessRemovedMessage(
        ctx: Context,
        chatID: string | number
    ) {
        await ctx.api.sendMessage(
            chatID,
            whiteListMessages.alreadyRemoved.replace(
                /xxx/i,
                `<code>${chatID}</code>`
            ),
            {
                parse_mode: 'HTML'
            }
        );
    }

    public static async sendIgnoredMessage(
        ctx: Context,
        chatID: string | number
    ) {
        await ctx.api.sendMessage(
            chatID,
            ignoreListMessages.chatMessage.replace(
                /xxx/i,
                `<code>${chatID}</code>`
            ),
            {
                parse_mode: 'HTML'
            }
        );
    }

    public static async leaveFromIgnoredChat(
        ctx: Context,
        chatID: string | number
    ) {
        await AsyncUtils.sendIgnoredMessage(ctx, chatID);
        await ctx.api.leaveChat(chatID);
    }

    /**
     * @deprecated Function is not used anymore. Will be deleted is later versions.
     */
    public static async addIDToLists(
        client: RedisClientType,
        chatID: string | number,
        listName: string,
        IDsList: string[]
    ): Promise<string[]> {
        await RedisSingleton.getInstance().pushValueToList(
            listName,
            String(chatID)
        );
        return [...IDsList, String(chatID)];
    }

    /**
     * @deprecated Function is not used anymore. Will be deleted is later versions.
     */
    public static async removeIDFromLists(
        client: RedisClientType,
        chatID: string | number,
        listName: string,
        IDsList: string[]
    ): Promise<string[]> {
        await RedisSingleton.getInstance().removeValueFromList(
            listName,
            String(chatID)
        );
        return IDsList.filter(id => id !== String(chatID));
    }
}
