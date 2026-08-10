import { InlineKeyboard } from "grammy";

import type { Context } from "#root/bot/context.js";

/**
 * Creates inline keyboard for updating message on sticker deletion
 *
 * @param ctx Context object for translations
 * @param chatID ID of chat for config update
 * @param userID ID of user for restricting buttons
 * @returns Inline keyboard with configured buttons
 */
export function createStickerMessageKeyboard(
    ctx: Context,
    chatID: string | number,
    userID?: string | number,
) {
    return new InlineKeyboard()
        .text(ctx.t("keyboardMessages.buttonYes"), `${userID}|${chatID}|yes`)
        .text(ctx.t("keyboardMessages.buttonNo"), `${userID}|${chatID}|no`);
}
