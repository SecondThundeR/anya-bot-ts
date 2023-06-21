import { Composer } from "@/deps.ts";

import helpMessages from "@/locales/helpMessages.ts";

const helpPMMessage = new Composer();

helpPMMessage.command("help", async (ctx) =>
    await ctx.reply(
        helpMessages.pmMessage,
        {
            parse_mode: "HTML",
        },
    ));

export default helpPMMessage;
