import { Composer } from "grammy";

import type { Context } from "#root/bot/context.js";
import { updateCommandStatus } from "#root/bot/helpers/chat.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType(["group", "supergroup"]);

feature.command("adminpower", logHandle("command-adminpower"), async (ctx) => {
    const updateResult = await updateCommandStatus({
        ctx,
        hashName: "adminPower",
        statusLocale: {
            enabled: ctx.t("aidenPower.enabled"),
            disabled: ctx.t("aidenPower.disabled"),
        },
    });
    await ctx.reply(updateResult, {
        reply_parameters: { message_id: ctx.msg.message_id },
    });
});

export { composer as adminPowerTriggerFeature };
