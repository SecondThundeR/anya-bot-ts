import { Composer } from "grammy";
import { getChatConfig } from "#drizzle/queries/chats.js";
import type { Context } from "#root/bot/context.js";
import { getChatID, isPremiumSticker } from "#root/bot/helpers/api.js";
import {
    canBotDeleteMessages,
    deleteUserMessage,
    generateStickerMessageLocale,
    isGroupAdmin,
} from "#root/bot/helpers/chat.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType(["group", "supergroup"]);

feature.on(
    "message:sticker",
    logHandle("handler-premium-stickers"),
    async (ctx) => {
        // Purely local check, so it gates everything that costs a request
        if (!isPremiumSticker(ctx)) return;

        const chatID = getChatID(ctx);
        const chatConfig = await getChatConfig(chatID);

        if (!(await canBotDeleteMessages(ctx))) return;

        const isAdminPowerEnabled = chatConfig?.adminPower ?? false;
        if (isAdminPowerEnabled && (await isGroupAdmin(ctx))) return;

        const deleteStatus = await deleteUserMessage(ctx);
        if (!deleteStatus) return;

        if (chatConfig?.isSilent ?? false) return;

        await ctx.reply(await generateStickerMessageLocale(ctx, chatID));
    },
);

export { composer as premiumStickersFeature };
