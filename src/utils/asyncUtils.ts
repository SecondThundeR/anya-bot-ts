import { Api, Context, InlineKeyboard } from 'grammy';
import { ChatFromGetChat, ChatMember } from 'grammy/types';

import ListsNames from '@data/listsNames';

import ignoreListMessages from '@locale/ignoreListMessages';
import keyboardMessages from '@locale/keyboardMessages';
import otherMessages from '@locale/otherMessages';
import whiteListMessages from '@locale/whiteListMessages';

import RedisSingleton from './redisSingleton';
import RegularUtils from './regularUtils';

export default class AsyncUtils {
    public static async logBotInfo(api: Api) {
        const botInfo = await api.getMe();
        console.log(`Started as ${botInfo.first_name} (@${botInfo.username})`);
        await api.sendMessage(
            String(process.env.CREATOR_ID),
            otherMessages.creatorMsg
        );
    }

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

    public static async incrementCommandUsageCounter(
        client: RedisSingleton,
        command: string
    ): Promise<void> {
        await client.incrementFieldBy('commandsUsage', command, 1);
    }

    public static async getCommandsUsage(
        client: RedisSingleton
    ): Promise<{ [key: string]: string }> {
        return await client.getAllHashData('commandsUsage');
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

    public static async isChatWhitelisted(
        ctx: Context,
        redisInstance: RedisSingleton
    ): Promise<boolean> {
        const chatID = RegularUtils.getChatID(ctx);
        const whiteListIDs = await redisInstance.getList(ListsNames.WHITELIST);

        return RegularUtils.isItemInList(chatID, whiteListIDs);
    }

    public static async isCommandIgnored(
        ctx: Context,
        redisInstance: RedisSingleton
    ): Promise<boolean> {
        const whiteListIDs = await redisInstance.getList(ListsNames.WHITELIST);
        const chatID = RegularUtils.getChatID(ctx);

        return (
            !RegularUtils.isItemInList(chatID, whiteListIDs) ||
            !(await AsyncUtils.isGroupAdmin(ctx))
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
}
