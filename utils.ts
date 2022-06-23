import {
    RedisClientType
} from "@redis/client";
import {
    Bot,
    Context,
    InlineKeyboard
} from "grammy";
import {
    ChatFromGetChat,
    User
} from "grammy/out/platform.node";
import {
    ignoreListLocale,
    keyboardLocale,
    otherLocale,
    stickerMessagesLocale,
    whiteListLocale
} from "./locale";

const chatsConfigTableName = 'chats_config'

// Regular Utils functions
export function isTimeoutExceeded(oldTimestamp: number, newTimestamp: number, timeoutSeconds: number): boolean {
    return newTimestamp - oldTimestamp > timeoutSeconds
}

export function isGroupAdmin(status: string): boolean {
    return status === 'administrator' || status === 'creator';
}

export function isBotCreator(userID: number | undefined, botCreatorID: string | undefined): boolean {
    return botCreatorID !== undefined || String(userID) === botCreatorID;
}

export function isStringEmpty(str: string): boolean {
    return str === "";
}

export function isInList(list: string[], item: number | string): boolean {
    return list.includes(String(item));
}

export function convertStringToBoolean(str: string): boolean {
    return str === 'true';
}

export function createMessageMentionLocaleKeyboard(chatID: string | number): InlineKeyboard {
    const timestamp = Math.floor(Date.now() / 1000);
    return new InlineKeyboard()
        .text(keyboardLocale["buttonYes"], `${timestamp}|${chatID}|yes`)
        .text(keyboardLocale["buttonNo"], `${timestamp}|${chatID}|no`);
}

export function getStickerMessageMentionLocale(text: string, isMention: string | null, userMention: string | null | undefined = null) {
    const mentionBoolean = isMention === null ? false : convertStringToBoolean(isMention);
    if (mentionBoolean) return `${userMention}, ${text}`;
    return text;
}

export function getWhiteListKeyboardLocale(inviteUser: string, chatData: string, isLeft: boolean): string {
    if (inviteUser === "null") inviteUser = otherLocale["unknownUser"];
    if (isLeft) return whiteListLocale["leftGroupInfo"].replace(/xxx/i, chatData)
    return whiteListLocale["newGroupInfo"].replace(/xxx/i, inviteUser).replace(/yyy/i, chatData);
}

export function getWhiteListKeyboardResponseLocale(isWhitelisted: boolean, isIgnored: boolean): string {
    if (isIgnored) return ignoreListLocale["keyboardAdded"];
    if (isWhitelisted) return whiteListLocale["keyboardAdded"];
    return whiteListLocale["keyboardRemoved"];
}

export function getUserMention(user: User): string {
    return user.username === undefined ? user.first_name : `@${user.username}`
}

export function checkLocaleWord(word: string | null, defaultWord: string): string {
    return word === null || word === "" ? defaultWord : word;
}

export function checkStickerMessageLocale(customText: string | null, stickerMessageMention: string | null): [string, string | null] {
    const stickerMessageLocale = checkLocaleWord(customText, stickerMessagesLocale["messageDefault"]);
    const stickerMessageMentionStatus = stickerMessageLocale === stickerMessagesLocale["messageDefault"] ? 'true' : stickerMessageMention;
    return [stickerMessageLocale, stickerMessageMentionStatus]
}

export async function getAuthorStatus(ctx: Context): Promise<string> {
    const authorData = await ctx.getAuthor();
    return authorData.status;
}

export async function getChatsByIDs(bot: Bot, chatsIDs: string[]): Promise<[ChatFromGetChat[], string[]]> {
    let chatsInfo: ChatFromGetChat[] = [];
    let idsInfo: string[] = [];
    await Promise.all(chatsIDs.map(async (id) => {
        await bot.api.getChat(id).then(chat => {
            chatsInfo.push(chat);
        }).catch(_ => {
            idsInfo.push(id);
        });
    }));
    return [chatsInfo, idsInfo];
}

export async function generateStickerLocaleMessage(client: RedisClientType, ctx: Context, chatID: number | string) {
    const [customText, stickerMessageMention] = await getHashMultipleData(
        client,
        chatID,
        ["stickerMessageLocale", "stickerMessageMention"]
    );
    const [checkedCustomText, checkedStickerMessageMentionStatus] =
    checkStickerMessageLocale(customText, stickerMessageMention);

    const userMention = getUserMention(ctx.update.message?.from!);
    return getStickerMessageMentionLocale(
        checkedCustomText,
        checkedStickerMessageMentionStatus,
        userMention
    );
}

export async function sendWhiteListKeyboard(bot: Bot, ctx: Context, chatID: string | number, chatName: string, creatorID: string | undefined, isLeft: boolean, isIgnored: boolean) {
    await ctx.reply(whiteListLocale["noAccess"]);
    await ctx.leaveChat();

    if (isIgnored) return;

    if (creatorID === undefined) return;

    const userInfo = ctx.update.my_chat_member?.from;
    let userMention: string;

    if (userInfo === undefined) {
        userMention = "null";
    } else {
        userMention = getUserMention(userInfo);
    }

    const keyboard = new InlineKeyboard()
        .text(keyboardLocale["buttonYes"], `${chatID}|accept`)
        .text(keyboardLocale["buttonNo"], `${chatID}|deny`).row()
        .text(keyboardLocale["buttonIgnore"], `${chatID}|ignore`);

    await bot.api.sendMessage(Number(creatorID), getWhiteListKeyboardLocale(userMention, `${chatName} (${chatID})`, isLeft), {
        reply_markup: keyboard,
    });
}

export async function addIDToLists(client: RedisClientType, chatID: string | number, listName: string, IDsList: string[]): Promise<string[]> {
    await addValueToList(client, listName, String(chatID));
    return [...IDsList, String(chatID)]
}

export async function removeIDFromLists(client: RedisClientType, chatID: string | number, listName: string, IDsList: string[]): Promise<string[]> {
    await deleteValueFromList(client, listName, String(chatID));
    return IDsList.filter((id) => id !== String(chatID));
}

// DB functions
export async function getHashSingleData(client: RedisClientType, chatID: number, hashName: string, defaultData: string = ""): Promise <string> {
    const dbData = await client.hGet(`${chatsConfigTableName}:${chatID}`, hashName) || defaultData;
    return dbData;
}

export async function getHashMultipleData(client: RedisClientType, chatID: number | string, hashNames: string[]): Promise <(string | null)[]> {
    const dbArrayData = await client.hmGet(`${chatsConfigTableName}:${chatID}`, hashNames);
    return dbArrayData;
}

export async function setHashData(client: RedisClientType, chatID: number | string, hashData: string[]) {
    await client.hSet(`${chatsConfigTableName}:${chatID}`, hashData);
}

export async function deleteHashData(client: RedisClientType, chatID: number | string, fieldsName: string[]) {
    await client.hDel(`${chatsConfigTableName}:${chatID}`, fieldsName);
}

export async function deleteHashKey(client: RedisClientType, chatID: number | string) {
    await client.del(`${chatsConfigTableName}:${chatID}`);
}

export async function getAllValuesFromList(client: RedisClientType, listName: string): Promise <string[]> {
    const dbArrayData = await client.lRange(listName, 0, -1);
    return dbArrayData;
}

export async function addValueToList(client: RedisClientType, listName: string, value: string) {
    await client.rPush(listName, value);
}

export async function deleteValueFromList(client: RedisClientType, listName: string, value: string) {
    await client.lRem(listName, 1, value);
}
