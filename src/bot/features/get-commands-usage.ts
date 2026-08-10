import { Composer } from "grammy";

import { getAllCommandsUsageQuery } from "#drizzle/prepared/commands-usage.js";
import type { Context } from "#root/bot/context.js";
import { isAdmin } from "#root/bot/filter/is-admin.js";
import { createCommandsUsageMessage } from "#root/bot/helpers/general.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private").filter(isAdmin);

feature.command(
    "getcmdusage",
    logHandle("command-getcmdusage"),
    async (ctx) => {
        const commandUsageData = await getAllCommandsUsageQuery.execute();

        if (commandUsageData.length === 0) {
            return await ctx.reply(ctx.t("cmdUsage.noUsageData"));
        }

        await ctx.reply(
            `${ctx.t("cmdUsage.messageHeader")}\n${createCommandsUsageMessage(
                ctx,
                commandUsageData,
            )}`,
        );
    },
);

export { composer as getCommandsUsageFeature };
