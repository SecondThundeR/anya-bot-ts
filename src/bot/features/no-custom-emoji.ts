import { Composer } from "grammy";

import { toggleChatConfigFlag } from "#drizzle/queries/chats.js";
import type { Context } from "#root/bot/context.js";
import { getChatID } from "#root/bot/helpers/api.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType(["group", "supergroup"]);

feature.command("noemoji", logHandle("command-noemoji"), async (ctx) => {
    const chatID = getChatID(ctx);

    const isStrictEmojiRemovalEnabled = await toggleChatConfigFlag(
        chatID,
        "strictEmojiRemoval",
    );

    await ctx.reply(
        isStrictEmojiRemovalEnabled
            ? ctx.t("noEmoji.enabled")
            : ctx.t("noEmoji.disabled"),
        {
            reply_parameters: { message_id: ctx.msg.message_id },
        },
    );
});

export { composer as noCustomEmojiFeature };
