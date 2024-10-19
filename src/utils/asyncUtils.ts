import { Api, ChatMember, Context, InlineKeyboard } from "@/deps.ts";
import type { ChatFromGetChat } from "@/deps.ts";

import SetsNames from "@/constants/setsNames.ts";

import { RedisClient } from "@/database/redisClient.ts";

import ignoreListMessages from "@/locales/ignoreListMessages.ts";
import keyboardMessages from "@/locales/keyboardMessages.ts";
import otherMessages from "@/locales/otherMessages.ts";
import whiteListMessages from "@/locales/whiteListMessages.ts";

import {
    getChatID,
    getChatInfo,
    getUser,
    getUserMention,
    isBotCanDelete,
} from "@/utils/apiUtils.ts";
import {
    getChatLink,
    getCreatorLink,
    getStickerMessageLocale,
    getWhiteListLocale,
    setPlaceholderData,
    stringToBoolean,
    verifyStickerMessageLocale,
} from "@/utils/generalUtils.ts";

type UpdateCommandStatusOptions = {
    ctx: Context;
    hashName: string;
    statusLocale: {
        enabled: string;
        disabled: string;
    };
};

export async function logBotInfo(api: Api) {
    const creatorID = Deno.env.get("CREATOR_ID");
    const botInfo = await api.getMe();
    const { deno, typescript, v8 } = Deno.version;

    console.log(
        `Started as ${botInfo.first_name} (@${botInfo.username})\nRunning on Deno ${deno} (TS: ${typescript}; V8: ${v8})`,
    );

    if (!creatorID) return;
    await api.sendMessage(
        creatorID,
        otherMessages.creatorMsg,
    );
}

export async function isBotInChat(
    ctx: Context,
    chatID: string | number,
) {
    try {
        await ctx.api.getChat(chatID);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Deletes user message via context object.
 * @param ctx Context object to delete message
 * @returns True if failed to delete message, False if succeeded
 */
export async function deleteUserMessage(
    ctx: Context,
) {
    try {
        await ctx.deleteMessage();
        return true;
    } catch (_e: unknown) {
        return false;
    }
}

export async function getAuthorStatus(ctx: Context) {
    const chatID = getChatID(ctx);
    const authorData = await ctx.getAuthor();
    const isAnonBot = ctx.update.message?.sender_chat?.id === chatID;
    return isAnonBot ? "anon" : authorData.status;
}

/**
 * Extracts chats data from array of chats IDs.
 * If chat was not found, it's ID will be added to the other array.
 *
 * @param ctx Context object to get the chats data by ID
 * @param chatsIDs Array of chats IDs
 * @returns Array of chats objects and array of chats IDs that were not found
 */
export async function getChatsByIDs(
    ctx: Context,
    chatsIDs: string[],
): Promise<[ChatFromGetChat[], string[]]> {
    const chatObjectArray: ChatFromGetChat[] = [];
    const chatIDArray: string[] = [];

    await Promise.all(chatsIDs.map(async (id) => {
        try {
            const chat = await ctx.api.getChat(id);
            chatObjectArray.push(chat);
        } catch (_) {
            chatIDArray.push(id);
        }
    }));

    return [chatObjectArray, chatIDArray];
}

export async function extractContextData(
    ctx: Context,
): Promise<[number, ChatMember, string]> {
    const chatID = getChatID(ctx);
    const botData = await ctx.getChatMember(ctx.me.id);
    const messageText = String(ctx.match) || "";
    return [chatID, botData, messageText];
}

export async function incrementCommandUsage(
    commandName: string,
) {
    await RedisClient.incrementFieldByValue(
        "commandsUsage",
        commandName,
        1,
    );
}

export async function resetLocaleHandler(
    ctx: Context,
    fieldsArray: string[],
    localeResetMessage: string,
) {
    const chatID = getChatID(ctx);
    const botData = await ctx.getChatMember(ctx.me.id);

    if (!(await isChatWhitelisted(ctx))) return;

    if (
        !(await isGroupAdmin(ctx)) &&
        isBotCanDelete(botData)
    ) {
        return await ctx.deleteMessage();
    }

    await RedisClient.removeFieldsFromConfig(
        chatID,
        ...fieldsArray,
    );

    await ctx.reply(localeResetMessage);
}

export async function isChatWhitelisted(ctx: Context) {
    return await RedisClient.isValueInSet(
        SetsNames.WHITELIST,
        getChatID(ctx),
    );
}

export async function asyncTimeout(ms: number) {
    return await new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export async function generateStickerMessageLocale(
    ctx: Context,
    chatID: number | string,
) {
    const [customText, stickerMessageMention] = await RedisClient
        .getValuesFromConfig(
            chatID,
            "stickerMessageLocale",
            "stickerMessageMention",
        );
    const [verifiedCustomText, verifiedStickerMessageMentionStatus] =
        verifyStickerMessageLocale(
            customText,
            stickerMessageMention,
        );
    const userMention = getUserMention(
        ctx.update.message?.from!,
    );
    return getStickerMessageLocale(
        verifiedCustomText,
        verifiedStickerMessageMentionStatus,
        userMention,
    );
}

export async function isNonAdminTriggered(ctx: Context) {
    const isChatNotWhitelisted = !(await isChatWhitelisted(ctx));
    const isNotGroupAdmin = !(await isGroupAdmin(ctx));
    return isChatNotWhitelisted || isNotGroupAdmin;
}

export async function isGroupAdmin(ctx: Context) {
    const authorStatus = await getAuthorStatus(ctx);
    return (
        authorStatus === "administrator" ||
        authorStatus === "creator" ||
        authorStatus === "anon"
    );
}

export async function newChatJoinHandler(
    ctx: Context,
    isIgnored: boolean,
) {
    const chatID = getChatID(ctx);
    const creatorID = Deno.env.get("CREATOR_ID");

    if (isIgnored) {
        const ignoredMessage = setPlaceholderData(
            ignoreListMessages.chatMessage,
            {
                link: getCreatorLink(),
                id: String(chatID),
            },
        );
        await ctx.reply(ignoredMessage, {
            parse_mode: "HTML",
        });
        return await ctx.leaveChat();
    }

    const whiteListMessage = setPlaceholderData(
        whiteListMessages.chatMessage,
        {
            link: getCreatorLink(),
            id: String(chatID),
        },
    );

    await ctx.reply(whiteListMessage, {
        parse_mode: "HTML",
    });

    if (!creatorID) return;

    const { title, username } = getChatInfo(ctx);
    const chatLink = getChatLink(username);
    const chatLinkMessage = chatLink !== undefined ? chatLink : title;
    const userInfo = getUser(ctx);
    const userMention = userInfo !== undefined
        ? getUserMention(userInfo)
        : undefined;
    const messageText = getWhiteListLocale(
        `${chatLinkMessage} (<code>${chatID}</code>)`,
        userMention,
    );
    const keyboard = new InlineKeyboard()
        .text(keyboardMessages.buttonYes, `${chatID}|accept`)
        .text(keyboardMessages.buttonNo, `${chatID}|deny`)
        .row()
        .text(keyboardMessages.buttonIgnore, `${chatID}|ignore`);

    await ctx.api.sendMessage(Number(creatorID), messageText, {
        reply_markup: keyboard,
        parse_mode: "HTML",
    });
}

export async function sendMessageByChatID(
    ctx: Context,
    chatID: string | number,
    messageText: string,
) {
    await ctx.api.sendMessage(chatID, messageText, {
        parse_mode: "HTML",
    });
}

export async function leaveFromIgnoredChat(
    ctx: Context,
    chatID: string | number,
) {
    await ctx.api.sendMessage(
        chatID,
        setPlaceholderData(
            ignoreListMessages.chatMessage,
            {
                link: getCreatorLink(),
                id: String(chatID),
            },
        ),
        {
            parse_mode: "HTML",
        },
    );
    await ctx.api.leaveChat(chatID);
}

export async function updateCommandStatus({
    ctx,
    hashName,
    statusLocale: { disabled, enabled },
}: UpdateCommandStatusOptions) {
    const chatID = getChatID(ctx);

    const isEnabledString = await RedisClient.getValueFromConfig(
        chatID,
        hashName,
    );
    const isEnabledReverse = !stringToBoolean(isEnabledString);

    if (isEnabledReverse) {
        await RedisClient.setConfigData(chatID, {
            [hashName]: String(isEnabledReverse),
        });
    } else {
        await RedisClient.removeFieldsFromConfig(chatID, hashName);
    }

    return isEnabledReverse ? enabled : disabled;
}

export async function getBotInChatInfo(ctx: Context, chatID: string | number) {
    return await ctx.api.getChatMember(chatID, ctx.me.id);
}
