import { Composer } from "grammy";

import type { Context } from "#root/bot/context.js";
import { isAdmin } from "#root/bot/filter/is-admin.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private").filter(isAdmin);

feature.command("start", logHandle("command-start"), async (ctx) => {
    return await ctx.reply(ctx.t("otherMessages.creatorPMHint"));
});

export { composer as startMessageFeature };
