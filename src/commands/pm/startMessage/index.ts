import { Composer } from "@/deps.ts";

import otherMessages from "@/locales/otherMessages.ts";

import RegularUtils from "@/utils/regularUtils.ts";

const startMessage = new Composer();

startMessage.command("start", async (ctx) => {
    if (!RegularUtils.isBotCreator(ctx)) {
        return await ctx.reply(otherMessages.noPMHint);
    }
    await ctx.reply(otherMessages.creatorPMHint);
});

export default startMessage;
