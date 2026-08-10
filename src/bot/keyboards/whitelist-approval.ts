import { InlineKeyboard } from "grammy";

import type { Context } from "#root/bot/context.js";

/**
 * Creates inline keyboard for approving new chat whitelisting
 *
 * @param ctx Context object for translations
 * @param chatID ID of chat to approve/deny/ignore
 * @returns Inline keyboard with configured buttons
 */
export function createWhitelistApprovalKeyboard(
    ctx: Context,
    chatID: string | number,
) {
    return new InlineKeyboard()
        .text(ctx.t("keyboardMessages.buttonYes"), `${chatID}|accept`)
        .text(ctx.t("keyboardMessages.buttonNo"), `${chatID}|deny`)
        .row()
        .text(ctx.t("keyboardMessages.buttonIgnore"), `${chatID}|ignore`);
}
