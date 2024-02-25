import { Composer } from "@/deps.ts";

import adminPowerMessages from "@/locales/adminPowerMessages.ts";

import { getMessageID } from "@/utils/apiUtils.ts";
import { updateCommandStatus } from "@/utils/asyncUtils.ts";

const COMMAND_NAME = "adminpower";

const adminPowerTrigger = new Composer();

adminPowerTrigger.command(COMMAND_NAME, async (ctx) => {
    const updateResult = await updateCommandStatus({
        ctx,
        hashName: COMMAND_NAME,
        statusLocale: adminPowerMessages,
    });
    await ctx.reply(updateResult, {
        reply_to_message_id: getMessageID(ctx.update.message),
    });
});

export default adminPowerTrigger;
