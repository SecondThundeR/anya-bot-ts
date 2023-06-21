import { Composer } from "@/deps.ts";

import otherMessages from "@/locale/otherMessages.ts";
import stickerMessages from "@/locale/stickerMessages.ts";

import RedisSingleton from "@/database/redisSingleton.ts";
import RegularUtils from "@/utils/regularUtils.ts";

import { deleteLocaleChangingStatus } from "@/groupHandlers/groupCallbackHandler/helpers.ts";

const groupCallbackHandler = new Composer();

groupCallbackHandler.on("callback_query:data", async (ctx) => {
    const redisSingleton = RedisSingleton.getInstance();
    const splitData = RegularUtils.getCallbackData(ctx).split("|");

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

    await deleteLocaleChangingStatus(redisSingleton, chatID);

    const botData = await ctx.api.getChatMember(chatID, ctx.me.id);
    if (RegularUtils.isBotCanDelete(botData)) await ctx.deleteMessage();

    const mentionModeBoolean = mentionMode === "yes";

    await redisSingleton.setHashData(chatID, {
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
