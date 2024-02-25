import { NICKNAME_CHARS } from "@/constants/nicknameChars.ts";

import ignoreListMessages from "@/locales/ignoreListMessages.ts";
import otherMessages from "@/locales/otherMessages.ts";
import whiteListMessages from "@/locales/whiteListMessages.ts";
import stickerMessages from "@/locales/stickerMessages.ts";

const { unknownUser, noCreatorLink } = otherMessages;
const { newChatInfo } = whiteListMessages;

/**
 * Converts boolean string to regular boolean
 * @param str Boolean as string
 * @returns False if string contains null or "false", True otherwise
 */
export function stringToBoolean(str: string | null) {
    if (!str) return false;
    return str === "true";
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
    isMention: string | null,
    userMention?: string,
) {
    const isMentionEnabled = stringToBoolean(isMention);
    if (isMentionEnabled) return `${userMention}, ${text}`;
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
 * Returns formatted string for whitelist approval mesasge
 *
 * @param chatData Formatted chat data with name and ID
 * @param inviteUser User mention string
 * @returns String with info on who invited bot and where
 */
export function getWhiteListLocale(
    chatData: string,
    inviteUser?: string,
) {
    if (!inviteUser) {
        return getWhiteListLocale(unknownUser, chatData);
    }
    return setPlaceholderData(newChatInfo, {
        user: inviteUser,
        chat: chatData,
    });
}

export function getWhiteListResponseLocale(
    isWhitelisted: boolean,
    isIgnored: boolean,
) {
    if (isIgnored) return ignoreListMessages.keyboardAdded;
    if (isWhitelisted) return whiteListMessages.keyboardAdded;
    return whiteListMessages.keyboardRemoved;
}

export function verifyLocaleWord(word: string | null, defaultWord: string) {
    if (!word) return defaultWord;
    return word;
}

export function verifyStickerMessageLocale(
    customText: string | null,
    stickerMessageMention: string | null,
) {
    const verifiedStickerMessage = verifyLocaleWord(
        customText,
        stickerMessages.messageDefault,
    );
    const mentionStatus =
        verifiedStickerMessage === stickerMessages.messageDefault
            ? "true"
            : stickerMessageMention;
    return [verifiedStickerMessage, mentionStatus] as const;
}

export function setPlaceholderData(
    placeholder: string,
    replacements: Record<string, string>,
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

export function generateNickname(length = 8) {
    const generateCallback = () =>
        NICKNAME_CHARS[Math.floor(Math.random() * NICKNAME_CHARS.length)];

    return Array.from({ length }, generateCallback).join("");
}

export function getCreatorLink() {
    return Deno.env.get("CREATOR_LINK") || noCreatorLink;
}

/**
 * Creates list part of message for `/getcmdusage`
 *
 * @param usageData Array of command usage data
 * @param usageMessage Message to set data in
 * @returns String of formatted command usage data representation
 */
export function createCommandsUsageMessage(
    usageData: string[],
    usageMessage: string,
) {
    // return usageData.map((value, index) => {
    //     if (index % 2 === 0) {
    //         const commandUsage = {
    //             name: value,
    //             count: usageData[index + 1],
    //         };
    //         return setPlaceholderData(usageMessage, commandUsage);
    //     }
    //     return "";
    // }).join("");
    return usageData.reduce(
        (acc: string[], _curr: string, i: number, arr: string[]): string[] => {
            if (i % 2 === 0) {
                const commandUsage = {
                    name: arr[i],
                    count: arr[i + 1],
                };
                const formattedUsage = setPlaceholderData(
                    usageMessage,
                    commandUsage,
                );
                acc.push(formattedUsage);
            }
            return acc;
        },
        [],
    ).join("");
}

/**
 * Converts array of IDs to string with IDs in code blocks
 * @param idsArray Array of IDs
 * @returns String with IDs in code blocks
 */
export function idsToCodeBlocks(idsArray: string[]) {
    return idsArray
        .map((id) => `<code>${id}</code>`)
        .join("\n");
}
