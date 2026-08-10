import { Composer } from "grammy";

import type { Context } from "#root/bot/context.js";
import { resetLocaleHandler } from "#root/bot/helpers/chat.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType(["group", "supergroup"]);

feature.command(
    "silentofflocalereset",
    logHandle("command-silentofflocalereset"),
    async (ctx) =>
        await resetLocaleHandler(
            ctx,
            { silentOffLocale: null },
            ctx.t("silentMessages.disabledMessageReset"),
        ),
);

export { composer as silentOffLocaleResetFeature };
