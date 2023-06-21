import { Composer } from "@/deps.ts";

import otherMessages from "@/locales/otherMessages.ts";

const startMessage = new Composer();

startMessage.command(
    "start",
    async (ctx) => await ctx.reply(otherMessages.creatorPMHint),
);

export default startMessage;
