import { Composer } from "grammy";
import { getChatConfig } from "#drizzle/queries/chats.js";
import type { Context } from "#root/bot/context.js";
import { getChatID, getUser, getUserMention } from "#root/bot/helpers/api.js";
import {
    canBotDeleteMessages,
    deleteUserMessage,
    isGroupAdmin,
} from "#root/bot/helpers/chat.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const AIDEN_QUOTES_COUNT = 7;

const composer = new Composer<Context>();

const feature = composer.chatType(["group", "supergroup"]);

feature.on(
    ["message:voice", "message:video_note"],
    logHandle("handler-voice-and-video"),
    async (ctx) => {
        const chatID = getChatID(ctx);
        const chatConfig = await getChatConfig(chatID);

        // The config checks run first so the admin lookup, a Bot API call, is
        // skipped in chats where the feature is off
        if (!(chatConfig?.aidenMode ?? false)) return;

        const isAdminPowerEnabled = chatConfig?.adminPower ?? false;
        if (isAdminPowerEnabled && (await isGroupAdmin(ctx))) return;

        if (!(await canBotDeleteMessages(ctx))) return;

        if (!(await deleteUserMessage(ctx))) return;

        // Silent mode still deletes, it only skips the quote reply
        if (chatConfig?.isAidenSilent ?? false) return;

        const quoteNumber = Math.floor(Math.random() * AIDEN_QUOTES_COUNT) + 1;
        const randomAidenMessage = ctx.t(`aidenPierce.quote-${quoteNumber}`);
        const user = getUser(ctx);
        const userMention = user
            ? getUserMention(user)
            : ctx.t("otherMessages.unknownUser");

        await ctx.reply(`${userMention}, ${randomAidenMessage}`);
    },
);

export { composer as voiceAndVideoFeature };
