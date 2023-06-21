import { Composer } from "@/deps.ts";

import AsyncUtils from "@/utils/asyncUtils.ts";
import RedisSingleton from "@/database/redisSingleton.ts";
import RegularUtils from "@/utils/regularUtils.ts";

import { updateSilentData } from "@/groupCommands/silentTrigger/helpers.ts";

const silentTrigger = new Composer();

silentTrigger.command("silent", async (ctx) => {
    const redisInstance = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(redisInstance, "silent");

    if (await AsyncUtils.isCommandIgnored(ctx, redisInstance)) return;

    const chatID = RegularUtils.getChatID(ctx);
    const replyText = await updateSilentData(redisInstance, chatID);
    await ctx.reply(replyText, {
        reply_to_message_id: RegularUtils.getMessageID(ctx.update.message),
    });
});

export default silentTrigger;
