import { Composer } from "@/deps.ts";

import { getMessageID } from "@/utils/apiUtils.ts";
import { updateCommandStatus } from "@/utils/asyncUtils.ts";

import aidenPierceMessages from "@/locales/aidenPierceMessages.ts";

const MAPPED_REPLY_TEXT = {
    disabled: aidenPierceMessages.silentDisabled,
    enabled: aidenPierceMessages.silentEnabled,
};

const aidenSilentTrigger = new Composer();

aidenSilentTrigger.command(
    "aidensilent",
    async (ctx) =>
        await ctx.reply(
            await updateCommandStatus(
                ctx,
                "isAidenSilent",
                MAPPED_REPLY_TEXT,
            ),
            {
                reply_to_message_id: getMessageID(ctx.update.message),
            },
        ),
);

export default aidenSilentTrigger;
