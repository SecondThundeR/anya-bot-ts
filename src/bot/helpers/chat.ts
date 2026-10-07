import {
    type BooleanConfigField,
    type ChatConfigPatch,
    getChatConfig,
    getChatListStatus,
    toggleChatConfigFlag,
    updateChatConfig,
} from "#drizzle/queries/chats.js";
import type { Context } from "#root/bot/context.js";
import {
    getChatID,
    getChatInfo,
    getUser,
    getUserMention,
    isBotCanDelete,
} from "#root/bot/helpers/api.js";
import {
    escapeHtml,
    getChatLink,
    getStickerMessageLocale,
    verifyStickerMessageLocale,
} from "#root/bot/helpers/general.js";
import { createWhitelistApprovalKeyboard } from "#root/bot/keyboards/whitelist-approval.js";

type UpdateCommandStatusOptions = {
    ctx: Context;
    hashName: BooleanConfigField;
    statusLocale: {
        enabled: string;
        disabled: string;
    };
};

const BOT_PERMISSIONS_TTL_MS = 60 * 1000;
const BOT_PERMISSIONS_MAX_SIZE = 1024;

type BotPermissionsEntry = {
    expiresAt: number;
    canDelete: boolean;
};

const botPermissions = new Map<number, BotPermissionsEntry>();

/**
 * Tells whether the bot may delete messages in a chat, caching the answer.
 *
 * The content filters run on every matching message, and each of them used to
 * call getChatMember. No invalidation is needed: the only cost of a stale
 * entry is that a permission change takes up to a minute to take effect
 *
 * @param ctx Context object for the Bot API call
 * @returns True if the bot is an admin that can delete messages
 */
export async function canBotDeleteMessages(ctx: Context) {
    const chatID = getChatID(ctx);
    const cached = botPermissions.get(chatID);

    if (cached && cached.expiresAt > Date.now()) {
        return cached.canDelete;
    }

    const botData = await ctx.getChatMember(ctx.me.id);
    const canDelete = isBotCanDelete(botData);

    if (botPermissions.size >= BOT_PERMISSIONS_MAX_SIZE) {
        const now = Date.now();
        for (const [key, entry] of botPermissions) {
            if (entry.expiresAt <= now) botPermissions.delete(key);
        }
        for (const key of botPermissions.keys()) {
            if (botPermissions.size < BOT_PERMISSIONS_MAX_SIZE) break;
            botPermissions.delete(key);
        }
    }

    botPermissions.delete(chatID);
    botPermissions.set(chatID, {
        expiresAt: Date.now() + BOT_PERMISSIONS_TTL_MS,
        canDelete,
    });

    return canDelete;
}

export async function isBotInChat(ctx: Context, chatID: string | number) {
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
export async function deleteUserMessage(ctx: Context) {
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

export async function isGroupAdmin(ctx: Context) {
    const authorStatus = await getAuthorStatus(ctx);
    return (
        authorStatus === "administrator" ||
        authorStatus === "creator" ||
        authorStatus === "anon"
    );
}

export function extractContextData(ctx: Context): [number, string] {
    return [getChatID(ctx), String(ctx.match) || ""];
}

export async function resetLocaleHandler(
    ctx: Context,
    resetValues: ChatConfigPatch,
    localeResetMessage: string,
) {
    const chatID = getChatID(ctx);

    await updateChatConfig(chatID, resetValues);

    await ctx.reply(localeResetMessage);
}

export async function isChatWhitelisted(ctx: Context) {
    return (await getChatListStatus(getChatID(ctx))) === "whitelisted";
}

export async function generateStickerMessageLocale(
    ctx: Context,
    chatID: number,
) {
    const chatConfig = await getChatConfig(chatID);
    const [verifiedCustomText, verifiedStickerMessageMentionStatus] =
        verifyStickerMessageLocale(
            ctx,
            chatConfig?.stickerMessageLocale ?? null,
            chatConfig?.stickerMessageMention ?? false,
        );
    const user = getUser(ctx);
    const userMention = user
        ? getUserMention(user)
        : ctx.t("otherMessages.unknownUser");
    return getStickerMessageLocale(
        verifiedCustomText,
        verifiedStickerMessageMentionStatus,
        userMention,
    );
}

export async function newChatJoinHandler(ctx: Context, isIgnored: boolean) {
    const chatID = getChatID(ctx);

    if (isIgnored) {
        await ctx.reply(ctx.t("ignoreListMessages.chatMessage"));
        return await ctx.leaveChat();
    }

    await ctx.reply(ctx.t("whiteListMessages.chatMessage"));

    const { adminIds } = ctx.config;
    if (adminIds.length === 0) return;

    const { title, username } = getChatInfo(ctx);
    const chatLink = getChatLink(username);
    const chatLinkMessage = chatLink ?? escapeHtml(title ?? "");
    const userInfo = getUser(ctx);
    const userMention =
        userInfo !== undefined
            ? getUserMention(userInfo)
            : ctx.t("otherMessages.unknownUser");
    const messageText = ctx.t("whiteListMessages.newChatInfo", {
        user: userMention,
        chat: `${chatLinkMessage} (<code>${chatID}</code>)`,
    });
    const keyboard = createWhitelistApprovalKeyboard(ctx, chatID);

    await Promise.all(
        adminIds.map((adminID) =>
            ctx.api.sendMessage(adminID, messageText, {
                reply_markup: keyboard,
            }),
        ),
    );
}

export async function leaveFromIgnoredChat(
    ctx: Context,
    chatID: string | number,
) {
    await ctx.api.sendMessage(chatID, ctx.t("ignoreListMessages.chatMessage"));
    await ctx.api.leaveChat(chatID);
}

export async function updateCommandStatus({
    ctx,
    hashName,
    statusLocale: { disabled, enabled },
}: UpdateCommandStatusOptions) {
    const chatID = getChatID(ctx);

    const isEnabled = await toggleChatConfigFlag(chatID, hashName);

    return isEnabled ? enabled : disabled;
}
