import { Composer } from "grammy";

import { updateChatConfig } from "#drizzle/queries/chats.js";
import type { Context } from "#root/bot/context.js";
import { getCallbackData, isBotCanDelete } from "#root/bot/helpers/api.js";
import { getBotInChatInfo } from "#root/bot/helpers/chat.js";
import { parseStickerMentionCallback } from "#root/bot/helpers/general.js";
import { logHandle } from "#root/bot/helpers/logging.js";
import { takeMentionAnswerWait } from "#root/bot/store/pending-mention-answers.js";

const composer = new Composer<Context>();

const feature = composer.chatType(["group", "supergroup"]);

feature.on(
    "callback_query:data",
    logHandle("handler-group-callback"),
    async (ctx) => {
        const callbackData = parseStickerMentionCallback(getCallbackData(ctx));

        if (!callbackData) {
            return await ctx.answerCallbackQuery({
                text: ctx.t("otherMessages.callbackFailure"),
            });
        }

        const { userID, chatID, isMentionMode } = callbackData;
        const clickUserID = ctx.update.callback_query.from.id;

        if (userID !== String(clickUserID)) {
            return await ctx.answerCallbackQuery({
                text: ctx.t("otherMessages.callbackWrongUser"),
            });
        }

        // Claiming the question rejects clicks on a keyboard that already timed
        // out. The wording itself was stored when the command ran, so only the
        // mention mode is left to apply
        if (!takeMentionAnswerWait(Number(chatID))) {
            return await ctx.answerCallbackQuery({
                text: ctx.t("stickerMessages.timeoutError"),
            });
        }

        await updateChatConfig(Number(chatID), {
            stickerMessageMention: isMentionMode,
        });

        const botData = await getBotInChatInfo(ctx, chatID);
        if (isBotCanDelete(botData)) await ctx.deleteMessage();

        await ctx.answerCallbackQuery();

        await ctx.reply(
            `${ctx.t("stickerMessages.messageWithMentionChanged")} ${ctx.t(
                isMentionMode
                    ? "stickerMessages.mentionModeYes"
                    : "stickerMessages.mentionModeNo",
            )}`,
        );
    },
);

export { composer as groupCallbackFeature };
