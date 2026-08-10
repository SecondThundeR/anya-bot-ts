import { Composer } from "grammy";

import { updateChatConfig } from "#drizzle/queries/chats.js";
import type { Context } from "#root/bot/context.js";
import { getUserID } from "#root/bot/helpers/api.js";
import { extractContextData } from "#root/bot/helpers/chat.js";
import { logHandle } from "#root/bot/helpers/logging.js";
import { createStickerMessageKeyboard } from "#root/bot/keyboards/sticker-message.js";
import {
    isMentionAnswerPending,
    startMentionAnswerWait,
} from "#root/bot/store/pending-mention-answers.js";

const MESSAGE_LOCALE_WAIT_TIME_MS = 10 * 1000;

const composer = new Composer<Context>();

const feature = composer.chatType(["group", "supergroup"]);

feature.command(
    "messagelocale",
    logHandle("command-messagelocale"),
    async (ctx) => {
        const [chatID, newLocaleString] = extractContextData(ctx);
        const replyParameters = { message_id: ctx.msg.message_id };

        if (!newLocaleString) {
            return await ctx.reply(ctx.t("stickerMessages.noTextProvided"), {
                reply_parameters: replyParameters,
            });
        }

        if (isMentionAnswerPending(chatID)) {
            return await ctx.reply(ctx.t("stickerMessages.inProgress"), {
                reply_parameters: replyParameters,
            });
        }

        // Store the wording before announcing it, so a failed write reaches the
        // error boundary instead of telling the chat about a change that never
        // happened. Only the mention mode is left for the keyboard to answer,
        // and it keeps its current value if nobody does
        await updateChatConfig(chatID, {
            stickerMessageLocale: newLocaleString,
        });

        const userID = getUserID(ctx);
        const keyboard = createStickerMessageKeyboard(ctx, chatID, userID);

        const message = await ctx.reply(
            ctx.t("stickerMessages.mentionQuestion"),
            {
                reply_markup: keyboard,
                reply_parameters: replyParameters,
            },
        );

        startMentionAnswerWait(
            chatID,
            MESSAGE_LOCALE_WAIT_TIME_MS,
            () => void expireMentionQuestion(ctx, chatID, message.message_id),
        );
    },
);

async function expireMentionQuestion(
    ctx: Context,
    chatID: number,
    questionMessageID: number,
) {
    try {
        await ctx.api.deleteMessage(chatID, questionMessageID);
    } catch {
        ctx.logger.debug("Locale changing message was already deleted");
    }

    try {
        await ctx.reply(ctx.t("stickerMessages.timeoutError"));
    } catch (error) {
        ctx.logger.warn({
            msg: "failed to report the mention question timeout",
            err: error,
        });
    }
}

export { composer as messageLocaleFeature };
