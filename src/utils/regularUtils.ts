import { Context, InlineKeyboard } from '@/deps.ts';
import type {
    Chat,
    ChatFromGetChat,
    ChatMember,
    Message,
    User,
} from '@/deps.ts';

import ignoreListMessages from '@/locale/ignoreListMessages.ts';
import keyboardMessages from '@/locale/keyboardMessages.ts';
import otherMessages from '@/locale/otherMessages.ts';
import stickerMessages from '@/locale/stickerMessages.ts';
import whiteListMessages from '@/locale/whiteListMessages.ts';

type ReplacementObjectType = {
    [key: string]: string;
};

export default class RegularUtils {
    public static getSessionKey(ctx: Context) {
        return ctx.chat?.id.toString();
    }

    public static isPremiumSticker(ctx: Context) {
        return ctx.update.message?.sticker?.premium_animation !== undefined;
    }

    public static isBotCanDelete(botData: ChatMember) {
        return (
            botData.status === 'administrator' && botData.can_delete_messages
        );
    }

    public static isBotCreator(ctx: Context) {
        const botCreatorID = Deno.env.get('CREATOR_ID');
        const userID = RegularUtils.getUserID(ctx);
        return botCreatorID !== undefined && String(userID) === botCreatorID;
    }

    public static isStringEmpty(str: string) {
        return str === '';
    }

    public static isItemInList(item: number | string, list: string[]) {
        return list.includes(String(item));
    }

    public static getBoolean(str: string | null) {
        if (str === null) return false;
        return str === 'true';
    }

    public static getChatID(ctx: Context) {
        return (
            ctx.update.message?.chat.id! || ctx.update.edited_message?.chat.id!
        );
    }

    public static getUserID(ctx: Context) {
        return ctx.update.message?.from?.id!;
    }

    public static convertHelpMessageToHTMLFormat(helpMessage: string) {
        return helpMessage.replace(/\[/g, '<code>').replace(/]/g, '</code>');
    }

    public static getMessageID(msg: Message | undefined) {
        return msg?.message_id;
    }

    public static getCallbackData(ctx: Context) {
        return ctx.update.callback_query?.data || '';
    }

    public static getUserMention(user: User) {
        return user.username === undefined
            ? user.first_name
            : `@${user.username}`;
    }

    public static getChatInfo(
        ctx: Context,
    ): [string | undefined, string | undefined] {
        const chat = ctx.update.message?.chat;
        return [
            (chat as Chat.GroupChat).title,
            (chat as Chat.PrivateChat).username,
        ];
    }

    public static getUser(ctx: Context) {
        return ctx.update.message?.from;
    }

    public static getChatLink(
        chatLink: string | undefined,
    ) {
        return chatLink !== undefined ? `@${chatLink}` : undefined;
    }

    public static getListOfChats(chats: ChatFromGetChat[]) {
        return chats.map((chat) => {
            const chatID = chat.id;
            const chatName = (chat as Chat.GroupChat).title;
            const chatLink = RegularUtils.getChatLink(
                (chat as Chat.PrivateChat).username,
            );
            return `${
                chatLink === undefined ? chatName : chatLink
            } (<code>${chatID}</code>)`;
        });
    }

    public static getStickerMessageLocale(
        text: string,
        isMention: string | null,
        userMention: string | undefined = undefined,
    ) {
        let messageText = text;
        if (RegularUtils.getBoolean(isMention)) {
            messageText = `${userMention}, ` + messageText;
        }
        return messageText;
    }

    public static getWhiteListLocale(
        inviteUser: string | undefined,
        chatData: string,
    ) {
        if (inviteUser === undefined) inviteUser = otherMessages.unknownUser;
        return whiteListMessages.newChatInfo
            .replace(/xxx/i, inviteUser)
            .replace(/yyy/i, chatData);
    }

    public static getWhiteListResponseLocale(
        isWhitelisted: boolean,
        isIgnored: boolean,
    ) {
        if (isIgnored) return ignoreListMessages.keyboardAdded;
        if (isWhitelisted) return whiteListMessages.keyboardAdded;
        return whiteListMessages.keyboardRemoved;
    }

    public static getStickerMessageKeyboard(
        userID: string | number,
        chatID: string | number,
    ) {
        return new InlineKeyboard()
            .text(keyboardMessages.buttonYes, `${userID}|${chatID}|yes`)
            .text(keyboardMessages.buttonNo, `${userID}|${chatID}|no`);
    }

    public static verifyLocaleWord(
        word: string | null,
        defaultWord: string,
    ) {
        return word === null || word === '' ? defaultWord : word;
    }

    public static verifyStickerMessageLocale(
        customText: string | null,
        stickerMessageMention: string | null,
    ): [string, string | null] {
        const verifiedStickerMessage = RegularUtils.verifyLocaleWord(
            customText,
            stickerMessages.messageDefault,
        );
        const mentionStatus =
            verifiedStickerMessage === stickerMessages.messageDefault
                ? 'true'
                : stickerMessageMention;
        return [verifiedStickerMessage, mentionStatus];
    }

    public static setPlaceholderData(
        placeholder: string,
        replacements: ReplacementObjectType,
    ) {
        return placeholder.replace(
            /{(\w+)}/g,
            (placeholderWithDelimiters, placeholderWithoutDelimiters) =>
                Object.prototype.hasOwnProperty.call(
                        replacements,
                        placeholderWithoutDelimiters,
                    )
                    ? replacements[placeholderWithoutDelimiters]
                    : placeholderWithDelimiters,
        );
    }
}
