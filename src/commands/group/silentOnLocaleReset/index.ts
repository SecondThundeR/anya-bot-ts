import { Composer } from "@/deps.ts";

import ListsNames from "@/constants/listsNames.ts";

import silentMessages from "@/locales/silentMessages.ts";

import AsyncUtils from "@/utils/asyncUtils.ts";
import RedisSingleton from "@/database/redisSingleton.ts";

const silentOnLocaleReset = new Composer();

silentOnLocaleReset.command("silentonlocalereset", async (ctx) => {
    const redisInstance = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(
        redisInstance,
        "silentonlocalereset",
    );

    if (await AsyncUtils.isCommandIgnored(ctx, redisInstance)) return;

    const whiteListIDs = await redisInstance.getList(ListsNames.WHITELIST);

    await AsyncUtils.resetLocaleHandler(
        ctx,
        redisInstance,
        whiteListIDs,
        ["silentOnLocale"],
        silentMessages.enabledMessageReset,
    );
});

export default silentOnLocaleReset;
