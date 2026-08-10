import { Composer } from "grammy";

import { getChatConfig, toggleChatConfigFlag } from "#drizzle/queries/chats.js";
import type { Context } from "#root/bot/context.js";
import { getChatID } from "#root/bot/helpers/api.js";
import { escapeHtml } from "#root/bot/helpers/general.js";
import { logHandle } from "#root/bot/helpers/logging.js";

function getDefaultSilentWord(ctx: Context, currentStatus: boolean) {
    return currentStatus
        ? ctx.t("silentMessages.enabledDefault")
        : ctx.t("silentMessages.disabledDefault");
}

async function updateSilentData(ctx: Context, chatID: number) {
    // Read the wording first, then flip the flag atomically in the database.
    // A read-modify-write would let two concurrent /silent calls settle on the
    // same value instead of cancelling out
    const chatConfig = await getChatConfig(chatID);
    const isSilentEnabled = await toggleChatConfigFlag(chatID, "isSilent");

    // Chat-supplied wording is escaped; the locale fallback may carry markup
    const customWord =
        (isSilentEnabled
            ? chatConfig?.silentOnLocale
            : chatConfig?.silentOffLocale) ?? null;

    return customWord
        ? escapeHtml(customWord)
        : getDefaultSilentWord(ctx, isSilentEnabled);
}

const composer = new Composer<Context>();

const feature = composer.chatType(["group", "supergroup"]);

feature.command("silent", logHandle("command-silent"), async (ctx) => {
    const chatID = getChatID(ctx);
    const replyText = await updateSilentData(ctx, chatID);
    await ctx.reply(replyText, {
        reply_parameters: { message_id: ctx.msg.message_id },
    });
});

export { composer as silentTriggerFeature };
