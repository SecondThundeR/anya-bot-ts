import { Composer } from "grammy";

import type { Context } from "#root/bot/context.js";
import { resetLocaleHandler } from "#root/bot/helpers/chat.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType(["group", "supergroup"]);

feature.command(
    "silentonlocalereset",
    logHandle("command-silentonlocalereset"),
    async (ctx) =>
        await resetLocaleHandler(
            ctx,
            { silentOnLocale: null },
            ctx.t("silentMessages.enabledMessageReset"),
        ),
);

export { composer as silentOnLocaleResetFeature };
