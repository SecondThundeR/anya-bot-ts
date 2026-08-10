import { Composer } from "grammy";

import type { Context } from "#root/bot/context.js";
import { updateCommandStatus } from "#root/bot/helpers/chat.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType(["group", "supergroup"]);

feature.command("aidenmode", logHandle("command-aidenmode"), async (ctx) => {
    const updateResult = await updateCommandStatus({
        ctx,
        hashName: "aidenMode",
        statusLocale: {
            enabled: ctx.t("aidenPierce.enabled"),
            disabled: ctx.t("aidenPierce.disabled"),
        },
    });
    await ctx.reply(updateResult, {
        reply_parameters: { message_id: ctx.msg.message_id },
    });
});

export { composer as aidenModeFeature };
