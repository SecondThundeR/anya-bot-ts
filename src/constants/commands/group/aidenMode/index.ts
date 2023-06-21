import { Composer } from "@/deps.ts";

import aidenPierceMessages from "@/locales/aidenPierceMessages.ts";

import { getMessageID } from "@/utils/apiUtils.ts";
import { updateCommandStatus } from "@/utils/asyncUtils.ts";

const aidenMode = new Composer();

aidenMode.command(
    "aidenmode",
    async (ctx) =>
        await ctx.reply(
            await updateCommandStatus(
                ctx,
                "aidenMode",
                aidenPierceMessages,
            ),
            {
                reply_to_message_id: getMessageID(ctx.update.message),
            },
        ),
);

export default aidenMode;
