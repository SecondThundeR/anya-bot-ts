import { createWriteStream } from "node:fs";
import { unlink } from "node:fs/promises";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

import type { ChatMember, Message, Update, User } from "grammy/types";

import type { Context } from "#root/bot/context.js";
import { escapeHtml } from "#root/bot/helpers/general.js";

export async function downloadTelegramFileToPath(
    filePath: string,
    outputPath: string,
    token: string,
) {
    const file = await fetch(
        `https://api.telegram.org/file/bot${token}/${filePath}`,
    );

    if (!file.ok || !file.body) {
        return false;
    }

    try {
        await pipeline(
            Readable.fromWeb(file.body),
            createWriteStream(outputPath),
        );
        return true;
    } catch (error) {
        unlink(outputPath).catch(() => {});
        throw error;
    }
}

/**
 * Checks if a message has a premium sticker
 *
 * @param ctx Context object to check the premium sticker
 * @returns True if a message has a premium sticker, False otherwise
 */
export function isPremiumSticker(ctx: Context) {
    return ctx.update.message?.sticker?.premium_animation !== undefined;
}

/**
 * Returns the chat ID from the message
 *
 * Every caller runs behind a chat-type filter, so the ID is always there.
 * Throwing beats the previous cast, which let `undefined` travel as a `number`
 * and reach the database as `NaN`
 *
 * @param ctx Context object for getting chat ID from the message
 * @returns Extracted chat ID
 */
export function getChatID(ctx: Context) {
    const chatID = ctx.chat?.id ?? ctx.update.message?.chat.id;
    if (chatID === undefined) {
        throw new Error("Update carries no chat to take an ID from");
    }

    return chatID;
}

/**
 * Returns user ID from the message
 *
 * @param ctx Context object for getting user ID
 * @returns User's chat ID
 */
export function getUserID(ctx: Context) {
    const userID = ctx.from?.id;
    if (userID === undefined) {
        throw new Error("Update carries no user to take an ID from");
    }

    return userID;
}

/**
 * Returns object with chat's title and username
 *
 * If chat is private, username will be undefined
 *
 * @param ctx Context object to extract chat's title and username
 * @returns Object with chat's title and username
 */
export function getChatInfo(
    ctx?: Context,
    message?: Message & Update.NonChannel,
) {
    const chat = ctx ? ctx.update.message?.chat : message?.chat;
    let title: string | undefined;
    let username: string | undefined;

    if (chat === undefined) return { title, username };

    if (chat.type === "supergroup") {
        title = chat.title;
        username = chat.username;
    } else if (chat.type === "group") {
        title = chat.title;
    } else if (chat.type === "private") {
        username = chat.username;
    }

    return {
        title,
        username,
    };
}

/**
 * Returns user information from the message
 *
 * @param ctx Context object to extract user info
 * @returns Object with user information
 */
export function getUser(ctx: Context) {
    return ctx.update.message?.from;
}

/**
 * Returns status of bot's ability to delete message
 *
 * @param botData Info about bot's membership in group
 * @returns True if bot can delete messages, False otherwise
 */
export function isBotCanDelete(botData: ChatMember) {
    return botData.status === "administrator" && botData.can_delete_messages;
}

/**
 * Returns ID of message from Message object
 *
 * @param msg Message object to extract ID from
 * @returns ID of message
 */
export function getMessageID(msg?: Message) {
    return msg?.message_id;
}

/**
 * Returns callback query data from context object
 *
 * If data is undefined, returns empty string
 * @param ctx Context object for extracting callback query data
 * @returns Data of callback query button
 */
export function getCallbackData(ctx: Context) {
    return ctx.update.callback_query?.data || "";
}

/**
 * Returns user's username for mention
 *
 * If user has no username, returns first name of user.
 * The first name is escaped because it is arbitrary user input, while
 * usernames are limited to `[A-Za-z0-9_]` by Telegram
 *
 * @param user User object to extract data for mention
 * @returns String with user mention or name, safe for HTML parse mode
 */
export function getUserMention(user: User) {
    return !user.username ? escapeHtml(user.first_name) : `@${user.username}`;
}
