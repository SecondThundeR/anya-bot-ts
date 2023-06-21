import { Composer } from "@/deps.ts";

import { getMessageID } from "@/utils/apiUtils.ts";
import { updateCommandStatus } from "@/utils/asyncUtils.ts";

import adminPowerMessages from "@/locales/adminPowerMessages.ts";

const adminPowerTrigger = new Composer();

adminPowerTrigger.command(
    "adminpower",
    async (ctx) =>
        await ctx.reply(
            await updateCommandStatus(
                ctx,
                "adminPower",
                adminPowerMessages,
            ),
            {
                reply_to_message_id: getMessageID(ctx.update.message),
            },
        ),
);

export default adminPowerTrigger;
