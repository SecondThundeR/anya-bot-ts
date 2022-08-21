import { Context, InlineKeyboard } from 'grammy';
import { Chat, ChatFromGetChat, ChatMember, Message, User } from 'grammy/types';
import otherMessages from '../locale/otherMessages';
import whiteListMessages from '../locale/whiteListMessages';
import ignoreListMessages from '../locale/ignoreListMessages';
import keyboardMessages from '../locale/keyboardMessages';
import stickerMessages from '../locale/stickerMessages';

type ChatInfoTuple = [string | undefined, string | undefined];

export default class RegularUtils {
    public static getSessionKey(ctx: Context): string | undefined {
        return ctx.chat?.id.toString();
    }

    public static isPremiumSticker(ctx: Context): boolean {
        return ctx.update.message?.sticker?.premium_animation !== undefined;
    }

    public static isGroupAdmin(status: string): boolean {
        return (
            status === 'administrator' ||
            status === 'creator' ||
            status === 'anon'
        );
    }

    public static isBotCanDelete(botData: ChatMember): boolean {
        return (
            botData.status === 'administrator' && botData.can_delete_messages
        );
    }

    public static isBotCreator(
        userID: number | undefined,
        botCreatorID: string | undefined
    ): boolean {
        return botCreatorID !== undefined && String(userID) === botCreatorID;
    }

    public static isStringEmpty(str: string): boolean {
        return str === '';
    }

    public static isItemInList(item: number | string, list: string[]): boolean {
        return list.includes(String(item));
    }

    public static getBoolean(str: string | null): boolean {
        if (str === null) return false;
        return str === 'true';
    }

    public static getChatID(ctx: Context): number {
        return (
            ctx.update.message?.chat.id! || ctx.update.edited_message?.chat.id!
        );
    }

    public static getUserID(ctx: Context): number {
        return ctx.update.message?.from?.id!;
    }

    public static getMessageID(msg: Message | undefined): number | undefined {
        return msg?.message_id;
    }

    public static getCallbackData(ctx: Context): string {
        return ctx.update.callback_query?.data || '';
    }

    public static getUserMention(user: User): string {
        return user.username === undefined
            ? user.first_name
            : `@${user.username}`;
    }

    public static getChatInfo(ctx: Context): ChatInfoTuple {
        const chat = ctx.update.message?.chat;
        return [
            (chat as Chat.TitleChat).title,
            (chat as Chat.UserNameChat).username
        ];
    }

    public static getUser(ctx: Context): User | undefined {
        return ctx.update.message?.from;
    }

    public static getChatLink(
        chatLink: string | undefined
    ): string | undefined {
        return chatLink !== undefined ? `@${chatLink}` : undefined;
    }

    public static getListOfChats(chats: ChatFromGetChat[]): string[] {
        return chats.map(chat => {
            const chatID = chat.id;
            const chatName = (chat as Chat.TitleChat).title;
            const chatLink = RegularUtils.getChatLink(
                (chat as Chat.UserNameChat).username
            );
            return `${
                chatLink === undefined ? chatName : chatLink
            } (<code>${chatID}</code>)`;
        });
    }

    public static getStickerMessageLocale(
        text: string,
        isMention: string | null,
        userMention: string | undefined = undefined
    ) {
        let messageText = text;
        if (RegularUtils.getBoolean(isMention))
            messageText = `${userMention}, ` + messageText;
        return messageText;
    }

    public static getWhiteListLocale(
        inviteUser: string | undefined,
        chatData: string
    ): string {
        if (inviteUser === undefined) inviteUser = otherMessages.unknownUser;
        return whiteListMessages.newGroupInfo
            .replace(/xxx/i, inviteUser)
            .replace(/yyy/i, chatData);
    }

    public static getWhiteListResponseLocale(
        isWhitelisted: boolean,
        isIgnored: boolean
    ): string {
        if (isIgnored) return ignoreListMessages.keyboardAdded;
        if (isWhitelisted) return whiteListMessages.keyboardAdded;
        return whiteListMessages.keyboardRemoved;
    }

    public static getStickerMessageKeyboard(
        userID: string | number,
        chatID: string | number
    ): InlineKeyboard {
        return new InlineKeyboard()
            .text(keyboardMessages.buttonYes, `${userID}|${chatID}|yes`)
            .text(keyboardMessages.buttonNo, `${userID}|${chatID}|no`);
    }

    public static verifyLocaleWord(
        word: string | null,
        defaultWord: string
    ): string {
        return word === null || word === '' ? defaultWord : word;
    }

    public static verifyStickerMessageLocale(
        customText: string | null,
        stickerMessageMention: string | null
    ): [string, string | null] {
        const verifiedStickerMessage = RegularUtils.verifyLocaleWord(
            customText,
            stickerMessages.messageDefault
        );
        const mentionStatus =
            verifiedStickerMessage === stickerMessages.messageDefault
                ? 'true'
                : stickerMessageMention;
        return [verifiedStickerMessage, mentionStatus];
    }
}
