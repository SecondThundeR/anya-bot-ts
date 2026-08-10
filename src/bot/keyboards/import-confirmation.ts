import { InlineKeyboard } from "grammy";

import type { Context } from "#root/bot/context.js";

export const IMPORT_CONFIRM_DATA = "import:confirm";
export const IMPORT_CANCEL_DATA = "import:cancel";

/**
 * Creates the inline keyboard guarding a database restore
 *
 * @param ctx Context object for translations
 * @returns Inline keyboard with confirm and cancel buttons
 */
export function createImportConfirmationKeyboard(ctx: Context) {
    return new InlineKeyboard()
        .text(ctx.t("importMessages.buttonConfirm"), IMPORT_CONFIRM_DATA)
        .text(ctx.t("importMessages.buttonCancel"), IMPORT_CANCEL_DATA);
}
