import { RedisClientType } from '@redis/client';
import { Bot, Context, InlineKeyboard } from 'grammy';
import {
    ChatFromGetChat,
    ChatMember,
    Message,
    User
} from 'grammy/out/platform.node';
import {
    ignoreListLocale,
    keyboardLocale,
    otherLocale,
    stickerMessagesLocale,
    whiteListLocale
} from './locale';

const chatsConfigTableName = 'chats_config';

// Regular Utils Functions
export function isPremiumSticker(ctx: Context): boolean {
    return ctx.update.message?.sticker?.premium_animation !== undefined;
}

export function isGroupAdmin(status: string): boolean {
    return status === 'administrator' || status === 'creator';
}

export function isBotCanDelete(botData: ChatMember): boolean {
    return (
        botData.status === 'administrator' &&
        botData.can_delete_messages === true
    );
}

export function isBotCreator(
    userID: number | undefined,
    botCreatorID: string | undefined
): boolean {
    return botCreatorID !== undefined || String(userID) === botCreatorID;
}

export function isStringEmpty(str: string): boolean {
    return str === '';
}

export function isItemInList(item: number | string, list: string[]): boolean {
    return list.includes(String(item));
}

export function getBoolean(str: string | null): boolean {
    if (str === null) return false;
    return str === 'true';
}

export function getSessionKey(ctx: Context): string | undefined {
    return ctx.chat?.id.toString();
}

export function getChatID(ctx: Context): number {
    return ctx.update.message?.chat.id!;
}

export function getUserID(ctx: Context): number {
    return ctx.update.message?.from?.id!;
}

export function getMessageID(msg: Message | undefined): number | undefined {
    return msg?.message_id;
}

export function getCallbackData(ctx: Context): string {
    return ctx.update.callback_query?.data || '';
}

export function getUserMention(user: User): string {
    return user.username === undefined ? user.first_name : `@${user.username}`;
}

export function getChatInfo(
    ctx: Context
): [string | undefined, string | undefined] {
    // @ts-ignore
    return [ctx.update.message?.chat.title, ctx.update.message?.chat.username];
}

export function getUser(ctx: Context): User | undefined {
    return ctx.update.message?.from;
}

export function getChatLink(chatLink: string | undefined): string | undefined {
    return chatLink !== undefined ? `@${chatLink}` : undefined;
}

export function getListOfChats(chats: ChatFromGetChat[]): string[] {
    return chats.map(chat => {
        const chatID = chat.id;
        // @ts-ignore
        const chatName = chat.title;
        // @ts-ignore
        const chatLink = getChatLink(chat.username);
        return `${
            chatLink === undefined ? chatName : chatLink
        } (<code>${chatID}</code>)`;
    });
}

export function getStickerMessageLocale(
    text: string,
    isMention: string | null,
    userMention: string | undefined = undefined
) {
    let messageText = text;
    if (getBoolean(isMention)) messageText = `${userMention}, ` + messageText;
    return messageText;
}

export function getWhiteListLocale(
    inviteUser: string | undefined,
    chatData: string
): string {
    if (inviteUser === undefined) inviteUser = otherLocale['unknownUser'];
    return whiteListLocale['newGroupInfo']
        .replace(/xxx/i, inviteUser)
        .replace(/yyy/i, chatData);
}

export function getWhiteListResponseLocale(
    isWhitelisted: boolean,
    isIgnored: boolean
): string {
    if (isIgnored) return ignoreListLocale['keyboardAdded'];
    if (isWhitelisted) return whiteListLocale['keyboardAdded'];
    return whiteListLocale['keyboardRemoved'];
}

export function getStickerMessageKeyboard(
    userID: string | number,
    chatID: string | number
): InlineKeyboard {
    return new InlineKeyboard()
        .text(keyboardLocale['buttonYes'], `${userID}|${chatID}|yes`)
        .text(keyboardLocale['buttonNo'], `${userID}|${chatID}|no`);
}

export function verifyLocaleWord(
    word: string | null,
    defaultWord: string
): string {
    return word === null || word === '' ? defaultWord : word;
}

export function verifyStickerMessageLocale(
    customText: string | null,
    stickerMessageMention: string | null
): [string, string | null] {
    const stickerMessageLocale = verifyLocaleWord(
        customText,
        stickerMessagesLocale['messageDefault']
    );
    const mentionStatus =
        stickerMessageLocale === stickerMessagesLocale['messageDefault']
            ? 'true'
            : stickerMessageMention;
    return [stickerMessageLocale, mentionStatus];
}

// Async Utils Functions
export async function isBotInChat(
    bot: Bot,
    chatID: string | number
): Promise<boolean> {
    let isInChat: boolean = true;
    await bot.api
        .getChat(chatID)
        .then()
        .catch(_ => {
            isInChat = false;
        });
    return isInChat;
}

export async function isMessageAlreadyDeleted(ctx: Context): Promise<boolean> {
    let alreadyDeleted = false;
    await ctx
        .deleteMessage()
        .then()
        .catch(_ => {
            alreadyDeleted = true;
        });
    return alreadyDeleted;
}

export async function getAuthorStatus(ctx: Context): Promise<string> {
    const authorData = await ctx.getAuthor();
    return authorData.status;
}

export async function getChatsByIDs(
    bot: Bot,
    chatsIDs: string[]
): Promise<[ChatFromGetChat[], string[]]> {
    let chats: ChatFromGetChat[] = [];
    let ids: string[] = [];
    await Promise.all(
        chatsIDs.map(async id => {
            await bot.api
                .getChat(id)
                .then(chat => {
                    chats.push(chat);
                })
                .catch(_ => {
                    ids.push(id);
                });
        })
    );
    return [chats, ids];
}

export async function asyncTimeout(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

export async function generateStickerMessageLocale(
    client: RedisClientType,
    ctx: Context,
    chatID: number | string
) {
    const [customText, stickerMessageMention] = await getHashMultipleData(
        client,
        chatID,
        ['stickerMessageLocale', 'stickerMessageMention']
    );
    const [verifiedCustomText, verifiedStickerMessageMentionStatus] =
        verifyStickerMessageLocale(customText, stickerMessageMention);
    const userMention = getUserMention(ctx.update.message?.from!);
    return getStickerMessageLocale(
        verifiedCustomText,
        verifiedStickerMessageMentionStatus,
        userMention
    );
}

export async function newChatJoinHandler(
    bot: Bot,
    ctx: Context,
    creatorID: string | undefined,
    isIgnored: boolean
) {
    const chatID = getChatID(ctx);

    if (isIgnored) {
        const ignoredMessage = ignoreListLocale['noAccess'].replace(
            /xxx/i,
            `<code>${chatID}</code>`
        );
        await ctx.reply(ignoredMessage, {
            parse_mode: 'HTML'
        });
        return await ctx.leaveChat();
    }

    const whiteListMessage = whiteListLocale['noAccess'].replace(
        /xxx/i,
        `<code>${chatID}</code>`
    );

    await ctx.reply(whiteListMessage, {
        parse_mode: 'HTML'
    });

    if (creatorID === undefined) return;

    const [chatName, chatUsername] = getChatInfo(ctx);
    const chatLink = getChatLink(chatUsername);
    const chatLinkMessage = chatLink !== undefined ? chatLink : chatName;
    const userInfo = getUser(ctx);
    const userMention =
        userInfo !== undefined ? getUserMention(userInfo) : undefined;
    const messageText = getWhiteListLocale(
        userMention,
        `${chatLinkMessage} (<code>${chatID}</code>)`
    );
    const keyboard = new InlineKeyboard()
        .text(keyboardLocale['buttonYes'], `${chatID}|accept`)
        .text(keyboardLocale['buttonNo'], `${chatID}|deny`)
        .row()
        .text(keyboardLocale['buttonIgnore'], `${chatID}|ignore`);

    await bot.api.sendMessage(Number(creatorID), messageText, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
    });
}

export async function sendAccessGrantedMessage(
    bot: Bot,
    chatID: string | number
) {
    await bot.api.sendMessage(chatID, whiteListLocale['accessGranted']);
}

export async function sendAccessRemovedMessage(
    bot: Bot,
    chatID: string | number
) {
    await bot.api.sendMessage(
        chatID,
        whiteListLocale['accessRemoved'].replace(
            /xxx/i,
            `<code>${chatID}</code>`
        ),
        {
            parse_mode: 'HTML'
        }
    );
}

export async function sendIgnoredMessage(bot: Bot, chatID: string | number) {
    await bot.api.sendMessage(
        chatID,
        ignoreListLocale['noAccess'].replace(/xxx/i, `<code>${chatID}</code>`),
        {
            parse_mode: 'HTML'
        }
    );
}

export async function leaveFromIgnoredChat(bot: Bot, chatID: string | number) {
    await sendIgnoredMessage(bot, chatID);
    await bot.api.leaveChat(chatID);
}

export async function addIDToLists(
    client: RedisClientType,
    chatID: string | number,
    listName: string,
    IDsList: string[]
): Promise<string[]> {
    await pushValueToList(client, listName, String(chatID));
    return [...IDsList, String(chatID)];
}

export async function removeIDFromLists(
    client: RedisClientType,
    chatID: string | number,
    listName: string,
    IDsList: string[]
): Promise<string[]> {
    await removeValueFromList(client, listName, String(chatID));
    return IDsList.filter(id => id !== String(chatID));
}

// Database Utils functions
export async function getHashData(
    client: RedisClientType,
    chatID: number,
    hashName: string,
    defaultData: string = ''
): Promise<string> {
    return (
        (await client.hGet(`${chatsConfigTableName}:${chatID}`, hashName)) ||
        defaultData
    );
}

export async function getHashMultipleData(
    client: RedisClientType,
    chatID: number | string,
    hashNames: string[]
): Promise<(string | null)[]> {
    return await client.hmGet(`${chatsConfigTableName}:${chatID}`, hashNames);
}

export async function getAllValuesFromList(
    client: RedisClientType,
    listName: string
): Promise<string[]> {
    return await client.lRange(listName, 0, -1);
}

export async function setHashData(
    client: RedisClientType,
    chatID: number | string,
    hashData: string[]
) {
    await client.hSet(`${chatsConfigTableName}:${chatID}`, hashData);
}

export async function pushValueToList(
    client: RedisClientType,
    listName: string,
    value: string
) {
    await client.rPush(listName, value);
}

export async function deleteHashData(
    client: RedisClientType,
    chatID: number | string,
    fieldsName: string[]
) {
    await client.hDel(`${chatsConfigTableName}:${chatID}`, fieldsName);
}

export async function deleteHashTable(
    client: RedisClientType,
    chatID: number | string
) {
    await client.del(`${chatsConfigTableName}:${chatID}`);
}

export async function removeValueFromList(
    client: RedisClientType,
    listName: string,
    value: string
) {
    await client.lRem(listName, 1, value);
}
