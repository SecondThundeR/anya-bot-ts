import { Composer } from "@/deps.ts";

import otherMessages from "@/locale/otherMessages.ts";
import silentMessages from "@/locale/silentMessages.ts";

import AsyncUtils from "@/utils/asyncUtils.ts";
import RedisSingleton from "@/database/redisSingleton.ts";
import RegularUtils from "@/utils/regularUtils.ts";

const silentOnLocale = new Composer();

silentOnLocale.command("silentonlocale", async (ctx) => {
    const redisInstance = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(
        redisInstance,
        "silentonlocale",
    );

    if (await AsyncUtils.isCommandIgnored(ctx, redisInstance)) return;

    const [chatID, _, newLocaleString] = await AsyncUtils.extractContextData(
        ctx,
    );

    if (RegularUtils.isStringEmpty(newLocaleString)) {
        return await ctx.reply(otherMessages.stringIsEmpty);
    }

    await redisInstance.setHashData(chatID, {
        silentOnLocale: newLocaleString,
    });

    await ctx.reply(silentMessages.enabledMessageChange);
});

export default silentOnLocale;
