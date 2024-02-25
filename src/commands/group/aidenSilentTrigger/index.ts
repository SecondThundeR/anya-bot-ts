import { Composer } from "@/deps.ts";

import aidenPierceMessages from "@/locales/aidenPierceMessages.ts";

import { getMessageID } from "@/utils/apiUtils.ts";
import { updateCommandStatus } from "@/utils/asyncUtils.ts";

const MAPPED_REPLY_TEXT = {
    disabled: aidenPierceMessages.silentDisabled,
    enabled: aidenPierceMessages.silentEnabled,
};
const HASH_NAME = "isAidenSilent";

const aidenSilentTrigger = new Composer();

aidenSilentTrigger.command("aidensilent", async (ctx) => {
    const updateResult = await updateCommandStatus({
        ctx,
        hashName: HASH_NAME,
        statusLocale: MAPPED_REPLY_TEXT,
    });
    await ctx.reply(updateResult, {
        reply_to_message_id: getMessageID(ctx.update.message),
    });
});

export default aidenSilentTrigger;
