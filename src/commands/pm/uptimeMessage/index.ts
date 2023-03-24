import { Composer } from "grammy";

import RegularUtils from "@utils/regularUtils";

import { getUptimeMessage } from "./helpers";

const uptimeMessage = new Composer();

uptimeMessage.command("uptime", async ctx => {
    if (!RegularUtils.isBotCreator(ctx)) return;

    await ctx.reply(getUptimeMessage(), {
        parse_mode: "HTML"
    });
});

export default uptimeMessage;
