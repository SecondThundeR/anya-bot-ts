import { Composer } from "@/deps.ts";

import { RedisClient } from "@/database/redisClient.ts";

import otherMessages from "@/locales/otherMessages.ts";
import stickerMessages from "@/locales/stickerMessages.ts";

import { getCallbackData, isBotCanDelete } from "@/utils/apiUtils.ts";
import { getBotInChatInfo } from "@/utils/asyncUtils.ts";

const groupCallbackHandler = new Composer();

groupCallbackHandler.on("callback_query:data", async (ctx) => {
    const splitData = getCallbackData(ctx).split("|");

    if (splitData.length !== 3) {
        return await ctx.answerCallbackQuery({
            text: otherMessages.callbackFailure,
        });
    }

    const [userID, chatID, mentionMode] = splitData;
    const clickUserID = ctx.update.callback_query.from.id;

    if (userID != String(clickUserID)) {
        return await ctx.answerCallbackQuery({
            text: otherMessages.callbackWrongUser,
        });
    }

    await RedisClient.removeFieldsFromConfig(
        chatID,
        "isMessageLocaleChanging",
    );

    const botData = await getBotInChatInfo(ctx, chatID);
    if (isBotCanDelete(botData)) await ctx.deleteMessage();

    const mentionModeBoolean = mentionMode === "yes";

    await RedisClient.setConfigData(chatID, {
        stickerMessageMention: String(mentionModeBoolean),
    });

    await ctx.answerCallbackQuery();

    await ctx.reply(
        `${stickerMessages.messageWithMentionChanged} ${
            stickerMessages[
                mentionModeBoolean ? "mentionModeYes" : "mentionModeNo"
            ]
        }`,
    );
});

export default groupCallbackHandler;
