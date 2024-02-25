import { Composer } from "@/deps.ts";

import aidenPierceMessages from "@/locales/aidenPierceMessages.ts";

import { getMessageID } from "@/utils/apiUtils.ts";
import { updateCommandStatus } from "@/utils/asyncUtils.ts";

const COMMAND_NAME = "aidenmode";

const aidenMode = new Composer();

aidenMode.command(COMMAND_NAME, async (ctx) => {
    const updateResult = await updateCommandStatus({
        ctx,
        hashName: COMMAND_NAME,
        statusLocale: aidenPierceMessages,
    });
    await ctx.reply(updateResult, {
        reply_to_message_id: getMessageID(ctx.update.message),
    });
});

export default aidenMode;
