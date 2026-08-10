import { Composer } from "grammy";

import type { Context } from "#root/bot/context.js";
import { updateCommandStatus } from "#root/bot/helpers/chat.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType(["group", "supergroup"]);

feature.command(
    "aidensilent",
    logHandle("command-aidensilent"),
    async (ctx) => {
        const updateResult = await updateCommandStatus({
            ctx,
            hashName: "isAidenSilent",
            statusLocale: {
                enabled: ctx.t("aidenPierce.silentEnabled"),
                disabled: ctx.t("aidenPierce.silentDisabled"),
            },
        });
        await ctx.reply(updateResult, {
            reply_parameters: { message_id: ctx.msg.message_id },
        });
    },
);

export { composer as aidenSilentTriggerFeature };
