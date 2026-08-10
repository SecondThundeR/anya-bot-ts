import { Composer } from "grammy";

import type { Context } from "#root/bot/context.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType(["group", "supergroup"]);

feature.command("help", logHandle("command-help-group"), async (ctx) => {
    return await ctx.reply(ctx.t("help.groupMessage"));
});

export { composer as helpGroupMessageFeature };
