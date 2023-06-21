import {
    ChatFromGetChat,
    ChatMember,
    Context,
    InlineKeyboard,
    Message,
    User,
} from "@/deps.ts";

import keyboardMessages from "@/locales/keyboardMessages.ts";

import { getChatLink } from "@/utils/generalUtils.ts";

/**
 * Returns the user ID as the session key
 *
 * @param ctx Context object to get user ID
 * @returns Converted user ID to string
 */
export function getSessionKey(ctx: Context) {
    return ctx.from?.id.toString();
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
 * Checks if the user is the creator of the bot
 *
 * @param ctx Context object to get the user ID
 * @returns True if the user is the creator of the bot, False otherwise
 */
export function isUserACreator(ctx: Context) {
    const userID = getUserID(ctx);
    const creatorID = Deno.env.get("CREATOR_ID");
    if (!creatorID) return false;
    return String(userID) === creatorID;
}

/**
 * Returns the chat ID from the message
 *
 * @param ctx Context object for getting chat ID from the message
 * @returns Extracted chat ID
 */
export function getChatID(ctx: Context) {
    return (
        ctx.update.message?.chat.id! || ctx.update.edited_message?.chat.id!
    );
}

/**
 * Returns user ID from the message
 *
 * @param ctx Context object for getting user ID
 * @returns User's chat ID
 */
export function getUserID(ctx: Context) {
    return ctx.update.message?.from?.id! || ctx.callbackQuery?.from?.id;
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
    ctx: Context,
) {
    const chat = ctx.update.message?.chat;
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
    return (
        botData.status === "administrator" && botData.can_delete_messages
    );
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
 * If user has no username, returns first name of user
 * @param user User object to extract data for mention
 * @returns String with user mention or name
 */
export function getUserMention(user: User) {
    return !user.username ? user.first_name : `@${user.username}`;
}

/**
 * Creates inline keyboard for updating message on sticker deletion
 *
 * @param userID ID of user for restricting buttons
 * @param chatID ID of chat for config update
 * @returns Inline keyboard with configured buttons
 */
export function getStickerMessageKeyboard(
    userID: string | number,
    chatID: string | number,
) {
    return new InlineKeyboard()
        .text(keyboardMessages.buttonYes, `${userID}|${chatID}|yes`)
        .text(keyboardMessages.buttonNo, `${userID}|${chatID}|no`);
}

/**
 * Returns formatted string of chats link and IDs
 *
 * @param chats Array of chats to format
 * @returns Formatted string of chats
 */
export function chatsInfoToString(chats: ChatFromGetChat[]) {
    return chats.map((chat) => {
        const chatID = chat.id;
        let title: string | undefined;
        let username: string | undefined;

        if (chat.type === "supergroup") {
            title = chat.title;
            username = chat.username;
        } else if (chat.type === "group") {
            title = chat.title;
        } else if (chat.type === "private") {
            username = chat.username;
        }

        const link = getChatLink(username);

        return `${!link ? title : link} (<code>${chatID}</code>)`;
    }).join("\n");
}
