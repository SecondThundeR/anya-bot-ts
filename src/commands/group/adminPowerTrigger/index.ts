import { Composer } from "grammy";

import AsyncUtils from "@utils/asyncUtils";
import RedisSingleton from "@utils/redisSingleton";
import RegularUtils from "@utils/regularUtils";

import { updateAllowData } from "./helpers";

const adminPowerTrigger = new Composer();

adminPowerTrigger.command("adminpower", async ctx => {
    const redisInstance = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(redisInstance, "adminpower");

    if (await AsyncUtils.isCommandIgnored(ctx, redisInstance)) return;

    const replyText = await updateAllowData(
        redisInstance,
        RegularUtils.getChatID(ctx)
    );
    await ctx.reply(replyText, {
        reply_to_message_id: RegularUtils.getMessageID(ctx.update.message)
    });
});

export default adminPowerTrigger;
