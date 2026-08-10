import { Composer } from "grammy";

import { getChatConfig } from "#drizzle/queries/chats.js";
import type { Context } from "#root/bot/context.js";
import { getChatID } from "#root/bot/helpers/api.js";
import { canBotDeleteMessages, isGroupAdmin } from "#root/bot/helpers/chat.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType(["group", "supergroup"]);

feature.on(
    [
        "message:entities:custom_emoji",
        "edited_message:entities:custom_emoji",
        "message:caption_entities:custom_emoji",
        "edited_message:caption_entities:custom_emoji",
    ],
    logHandle("handler-custom-emojis"),
    async (ctx) => {
        const chatConfig = await getChatConfig(getChatID(ctx));

        // Checked first: the feature is off by default, and every check below
        // costs a Bot API call
        if (!(chatConfig?.strictEmojiRemoval ?? false)) return;

        if (!(await canBotDeleteMessages(ctx))) return;

        const isAdminPowerEnabled = chatConfig?.adminPower ?? false;
        if (isAdminPowerEnabled && (await isGroupAdmin(ctx))) return;

        // The filter above already guarantees a custom emoji is present
        await ctx.deleteMessage();
    },
);

export { composer as customEmojisFeature };
