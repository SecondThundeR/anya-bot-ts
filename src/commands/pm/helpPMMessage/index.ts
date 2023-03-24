import { Composer } from "grammy";

import helpMessages from "@locale/helpMessages";

import RegularUtils from "@utils/regularUtils";

const helpPMMessage = new Composer();

helpPMMessage.command("help", async ctx => {
    if (RegularUtils.isBotCreator(ctx))
        return await ctx.reply(
            RegularUtils.convertHelpMessageToHTMLFormat(helpMessages.pmMessage),
            {
                parse_mode: "HTML"
            }
        );
});

export default helpPMMessage;
