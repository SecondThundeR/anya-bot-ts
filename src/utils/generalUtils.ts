import ignoreListMessages from "@/locales/ignoreListMessages.ts";
import otherMessages from "@/locales/otherMessages.ts";
import whiteListMessages from "@/locales/whiteListMessages.ts";
import stickerMessages from "@/locales/stickerMessages.ts";

/**
 * Converts boolean string to regular boolean
 * @param str Boolean as string
 * @returns False if string contains null or "false", True otherwise
 */
export function stringToBoolean(str: string | null) {
    return str === null ? false : str === "true";
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
    userMention: string | undefined = undefined,
) {
    return stringToBoolean(isMention) ? `${userMention}, ${text}` : text;
}

/**
 * Returns the chat link if it exists in format `@chatLink`
 *
 * @param chatLink Chat link to format
 * @returns Formatted chat link
 */
export function getChatLink(chatLink?: string) {
    return chatLink !== undefined ? `@${chatLink}` : undefined;
}

export function getWhiteListLocale(
    inviteUser: string | undefined,
    chatData: string,
) {
    if (!inviteUser) inviteUser = otherMessages.unknownUser;
    return setPlaceholderData(
        whiteListMessages.newChatInfo,
        {
            user: inviteUser,
            chat: chatData,
        },
    );
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
    return word === null || word === "" ? defaultWord : word;
}

export function verifyStickerMessageLocale(
    customText: string | null,
    stickerMessageMention: string | null,
): [string, string | null] {
    const verifiedStickerMessage = verifyLocaleWord(
        customText,
        stickerMessages.messageDefault,
    );
    const mentionStatus =
        verifiedStickerMessage === stickerMessages.messageDefault
            ? "true"
            : stickerMessageMention;
    return [verifiedStickerMessage, mentionStatus];
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

export function generateNickname(nicknameLength: number | undefined = 8) {
    const chars = "abcdefghijklmnopqrstuvwxyz".split("");
    return Array.from(
        { length: nicknameLength },
        () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
}

export function getCreatorLink() {
    return Deno.env.get("CREATOR_LINK") || "no link :c";
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
