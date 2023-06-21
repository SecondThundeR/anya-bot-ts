import { Composer } from "@/deps.ts";

import helpMessages from "@/locales/helpMessages.ts";

const helpGroupMessage = new Composer();

helpGroupMessage.command("help", async (ctx) =>
    await ctx.reply(
        helpMessages.groupMessage,
        {
            parse_mode: "HTML",
        },
    ));

export default helpGroupMessage;
