import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Readable } from "node:stream";

import type { SelectCommandUsage } from "#drizzle/schema.js";
import { NICKNAME_CHARS } from "#root/bot/constants/nickname-chars.js";
import type { Context } from "#root/bot/context.js";

/**
 * Escapes the characters Telegram's HTML parse mode treats as markup.
 *
 * Every reply goes out with `parse_mode: "HTML"` (see `createBot`), so any
 * text coming from a user - a display name, a chat title, a custom locale
 * string, subprocess output - has to be escaped before it lands in a message.
 * Otherwise a name like `<b` makes Telegram reject the whole send with
 * "can't parse entities"
 *
 * @param text Untrusted text to escape
 * @returns Text safe to interpolate into an HTML-formatted message
 */
export function escapeHtml(text: string) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

/**
 * Returns string for sticker message
 * Depending on isMention mode, returns string without or with mention
 *
 * @param text String for sticker message text
 * @param isMention Status of user mention
 * @param userMention Mention of user
 * @returns Generated string for sticker message
 */
export function getStickerMessageLocale(
    text: string,
    isMention: boolean,
    userMention?: string,
) {
    if (isMention) return `${userMention}, ${text}`;
    return text;
}

/**
 * Returns the chat link if it exists in format `@chatLink`
 *
 * @param chatLink Chat link to format
 * @returns Formatted chat link
 */
export function getChatLink(chatLink?: string) {
    if (!chatLink) return;
    return `@${chatLink}`;
}

/**
 * Returns reply message for whitelist keyboard actions
 *
 * @param ctx Context object for translations
 * @param isWhitelisted Status of chat whitelisting
 * @param isIgnored Status of chat ignoring
 * @returns Localized whitelist keyboard response
 */
export function getWhiteListResponseLocale(
    ctx: Context,
    isWhitelisted: boolean,
    isIgnored: boolean,
) {
    if (isIgnored) return ctx.t("ignoreListMessages.keyboardAdded");
    if (isWhitelisted) return ctx.t("whiteListMessages.keyboardAdded");
    return ctx.t("whiteListMessages.keyboardRemoved");
}

export function verifyLocaleWord(word: string | null, defaultWord: string) {
    if (!word) return defaultWord;
    return word;
}

export function verifyStickerMessageLocale(
    ctx: Context,
    customText: string | null,
    stickerMessageMention: boolean,
) {
    const defaultText = ctx.t("stickerMessages.messageDefault");
    const verifiedStickerMessage = verifyLocaleWord(customText, defaultText);
    const isDefaultText = verifiedStickerMessage === defaultText;
    const mentionStatus = isDefaultText ? true : stickerMessageMention;

    // The default comes from the locale file and may carry intentional markup;
    // a chat-supplied string must not
    return [
        isDefaultText ? defaultText : escapeHtml(verifiedStickerMessage),
        mentionStatus,
    ] as const;
}

export function generateNickname(length = 8) {
    const generateCallback = () =>
        NICKNAME_CHARS[Math.floor(Math.random() * NICKNAME_CHARS.length)];

    return Array.from({ length }, generateCallback).join("");
}

/**
 * Creates list part of message for `/getcmdusage`
 *
 * @param ctx Context object for translations
 * @param usageData Array of command usage rows
 * @returns String of formatted command usage data representation
 */
export function createCommandsUsageMessage(
    ctx: Context,
    usageData: SelectCommandUsage[],
) {
    return usageData
        .map(({ command, count }) =>
            ctx.t("cmdUsage.usageMessage", { name: command, count }),
        )
        .join("\n");
}

/**
 * Converts array of IDs to string with IDs in code blocks
 * @param idsArray Array of IDs
 * @returns String with IDs in code blocks
 */
export function idsToCodeBlocks(idsArray: string[]) {
    return idsArray.map((id) => `<code>${escapeHtml(id)}</code>`).join("\n");
}

export function createDumpTempFilePath(prefix: string) {
    return join(tmpdir(), `${prefix}-${randomUUID()}.dump`);
}

export async function readTextWithLimit(
    stream: Readable | null | undefined,
    maxBytes: number,
) {
    if (!stream) {
        return "";
    }

    const decoder = new TextDecoder();
    const chunks: string[] = [];
    let bytesRead = 0;
    let isTruncated = false;

    for await (const chunk of stream) {
        const buffer = chunk instanceof Buffer ? chunk : Buffer.from(chunk);

        if (bytesRead < maxBytes) {
            const remainingBytes = maxBytes - bytesRead;
            const chunkToDecode =
                buffer.length > remainingBytes
                    ? buffer.subarray(0, remainingBytes)
                    : buffer;

            chunks.push(decoder.decode(chunkToDecode, { stream: true }));
        }

        bytesRead += buffer.length;
        if (bytesRead > maxBytes) {
            isTruncated = true;
        }
    }

    chunks.push(decoder.decode());

    if (isTruncated) {
        chunks.push("\n... stderr output truncated");
    }

    return chunks.join("");
}

// The dice emoji has six faces
const DICE_MIN_VALUE = 1;
const DICE_MAX_VALUE = 6;

export type DiceCommand =
    | { status: "empty" }
    | { status: "noText" }
    | { status: "notANumber" }
    | { status: "wrongNumber" }
    | { status: "ok"; number: number; text: string };

/**
 * Parses the `/dice` arguments, expected in the `<number> <text>` form
 *
 * @param match Command arguments as given by grammY
 * @returns Either the parsed bet, or which validation failed
 */
export function parseDiceCommand(match: string): DiceCommand {
    const trimmed = match.trim();
    if (trimmed === "") return { status: "empty" };

    const [rawNumber, ...restParts] = trimmed.split(/\s+/);
    const text = restParts.join(" ");
    if (text === "") return { status: "noText" };

    const number = Number.parseInt(rawNumber, 10);
    if (Number.isNaN(number)) return { status: "notANumber" };

    if (number < DICE_MIN_VALUE || number > DICE_MAX_VALUE) {
        return { status: "wrongNumber" };
    }

    return { status: "ok", number, text };
}

/**
 * Parses the sticker mention keyboard callback payload
 *
 * @param data Raw callback query data in the `userID|chatID|mentionMode` form
 * @returns Parsed payload, or null if the data doesn't have the expected shape
 */
export function parseStickerMentionCallback(data: string) {
    const splitData = data.split("|");
    if (splitData.length !== 3) return null;

    const [userID, chatID, mentionMode] = splitData;
    return { userID, chatID, isMentionMode: mentionMode === "yes" };
}
