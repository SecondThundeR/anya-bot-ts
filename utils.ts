import {
    RedisClientType
} from "@redis/client";
import {
    Context
} from "grammy";
import {
    User
} from "grammy/out/platform.node";
import {
    otherLocale
} from "./locale";

const hashTableName = 'chats_config'

// Regular Utils functions
export function convertStringToBoolean(str: string): boolean {
    return str === 'true';
}

export function isAdmin(status: string): boolean {
    return status === 'administrator' || status === 'creator';
}

export function getUserMention(user: User): string {
    return user.username === undefined ? user.first_name : `@${user.username}`
}

export function getStickerMessageLocale(text: string, isMention: string | null, userMention: string | null = null) {
    const mentionBoolean = isMention === null ? false : convertStringToBoolean(isMention);
    if (mentionBoolean) return `${userMention}, ${text}`;
    return text;
}

export function checkLocaleWord(word: string | null, defaultWord: string): string {
    return word === null || word === "" ? defaultWord : word;
}

export function checkStickerMessageLocale(customText: string | null, stickerMessageMention: string | null): [string, string | null] {
    const stickerMessageLocale = checkLocaleWord(customText, otherLocale["defaultStickerMessageLocale"]);
    const stickerMessageMentionStatus = stickerMessageLocale === otherLocale["defaultStickerMessageLocale"] ? 'true' : stickerMessageMention;
    return [stickerMessageLocale, stickerMessageMentionStatus]
}

// Handler Utils functions
export async function adminOnlyCommandHandler(ctx: Context) {
    const authorData = await ctx.getAuthor();
    if (!isAdmin(authorData.status)) {
        await ctx.deleteMessage();
        return false;
    }
    return true;
}

// DB functions
export async function getHashSingleData(client: RedisClientType, chatID: number, hashName: string, defaultData: string = ""): Promise <string> {
    const dbData = await client.hGet(`${hashTableName}:${chatID}`, hashName) || defaultData;
    return dbData;
}

export async function getHashMultipleData(client: RedisClientType, chatID: number, hashNames: string[]): Promise <(string | null)[]> {
    const dbArrayData = await client.hmGet(`${hashTableName}:${chatID}`, hashNames);
    return dbArrayData;
}

export async function setHashData(client: RedisClientType, chatID: number | string, hashData: string[]) {
    await client.hSet(`${hashTableName}:${chatID}`, hashData);
}

export async function deleteHashData(client: RedisClientType, chatID: number | string, fieldsName: string[]) {
    await client.hDel(`${hashTableName}:${chatID}`, fieldsName);
}
