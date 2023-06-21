import { Composer } from "@/deps.ts";

import { getUptimeMessage } from "@/pmCommands/uptimeCommand/helpers.ts";

const uptimeCommand = new Composer();

uptimeCommand.command(
    "uptime",
    async (ctx) =>
        await ctx.reply(getUptimeMessage(), {
            parse_mode: "HTML",
        }),
);

export default uptimeCommand;
