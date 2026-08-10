import { Composer } from "grammy";

import type { Context } from "#root/bot/context.js";
import { isAdmin } from "#root/bot/filter/is-admin.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.on("callback_query", logHandle("unhandled-callback-query"), (ctx) =>
    ctx.callbackQuery.answer(),
);

feature.on("message", logHandle("unhandled-message"), async (ctx) => {
    // Non-admins get a hint that the bot doesn't work in PM
    if (isAdmin(ctx)) return;
    await ctx.reply(ctx.t("otherMessages.noPMHint"));
});

export { composer as unhandledFeature };
