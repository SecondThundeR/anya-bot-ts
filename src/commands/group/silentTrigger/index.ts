import { Composer } from "@/deps.ts";

import { updateSilentData } from "@/groupCommands/silentTrigger/helpers.ts";

import { getChatID, getMessageID } from "@/utils/apiUtils.ts";

const silentTrigger = new Composer();

silentTrigger.command("silent", async (ctx) => {
    const chatID = getChatID(ctx);
    const replyText = await updateSilentData(chatID);
    await ctx.reply(replyText, {
        reply_to_message_id: getMessageID(ctx.update.message),
    });
});

export default silentTrigger;
