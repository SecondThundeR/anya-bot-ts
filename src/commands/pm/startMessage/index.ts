import { Composer } from "grammy";

import otherMessages from "@locale/otherMessages";

import RegularUtils from "@utils/regularUtils";

const startMessage = new Composer();

startMessage.command("start", async ctx => {
    if (!RegularUtils.isBotCreator(ctx))
        return await ctx.reply(otherMessages.noPMHint);
    await ctx.reply(otherMessages.creatorPMHint);
});

export default startMessage;
