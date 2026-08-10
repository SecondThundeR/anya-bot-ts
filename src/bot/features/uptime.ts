import { Composer } from "grammy";

import type { Context } from "#root/bot/context.js";
import { isAdmin } from "#root/bot/filter/is-admin.js";
import { logHandle } from "#root/bot/helpers/logging.js";
import { getUptimeMessage } from "#root/bot/helpers/time.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private").filter(isAdmin);

feature.command("uptime", logHandle("command-uptime"), async (ctx) => {
    return await ctx.reply(getUptimeMessage(ctx));
});

export { composer as uptimeFeature };
