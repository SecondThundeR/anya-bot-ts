import { Composer } from "@/deps.ts";

import RegularUtils from "@/utils/regularUtils.ts";

import { getUptimeMessage } from "@/pmCommands/uptimeMessage/helpers.ts";

const uptimeMessage = new Composer();

uptimeMessage.command("uptime", async (ctx) => {
    if (!RegularUtils.isBotCreator(ctx)) return;
    await ctx.reply(getUptimeMessage(), {
        parse_mode: "HTML",
    });
});

export default uptimeMessage;
