import { Composer } from "@/deps.ts";

import redisClient from "@/database/redisClient.ts";

import cmdUsageMessages from "@/locales/cmdUsageMessages.ts";

import { createCommandsUsageMessage } from "@/utils/generalUtils.ts";

const MIN_COMMAND_USAGE_LENGTH = 2;

const getCommandsUsage = new Composer();

getCommandsUsage.command("getcmdusage", async (ctx) => {
    const commandUsageData = await redisClient.getAllValuesFromHash(
        "commandsUsage",
    );

    if (commandUsageData.length < MIN_COMMAND_USAGE_LENGTH) {
        return await ctx.reply(cmdUsageMessages.noUsageData);
    }

    await ctx.reply(
        `${cmdUsageMessages.messageHeader}${
            createCommandsUsageMessage(
                commandUsageData,
                cmdUsageMessages.usageMessage,
            )
        }`,
        {
            parse_mode: "HTML",
        },
    );
});

export default getCommandsUsage;
