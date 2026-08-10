import { Composer } from "grammy";

import type { Context } from "#root/bot/context.js";
import { resetLocaleHandler } from "#root/bot/helpers/chat.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType(["group", "supergroup"]);

feature.command(
    "messagelocalereset",
    logHandle("command-messagelocalereset"),
    async (ctx) =>
        await resetLocaleHandler(
            ctx,
            { stickerMessageLocale: null, stickerMessageMention: null },
            ctx.t("stickerMessages.messageReset"),
        ),
);

export { composer as messageLocaleResetFeature };
