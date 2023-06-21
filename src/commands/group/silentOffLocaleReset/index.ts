import { Composer } from "@/deps.ts";

import ListsNames from "@/constants/listsNames.ts";

import silentMessages from "@/locale/silentMessages.ts";

import AsyncUtils from "@/utils/asyncUtils.ts";
import RedisSingleton from "@/database/redisSingleton.ts";

const silentOffLocaleReset = new Composer();

silentOffLocaleReset.command("silentofflocalereset", async (ctx) => {
    const redisInstance = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(
        redisInstance,
        "silentofflocalereset",
    );

    if (await AsyncUtils.isCommandIgnored(ctx, redisInstance)) return;

    const whiteListIDs = await redisInstance.getList(ListsNames.WHITELIST);

    await AsyncUtils.resetLocaleHandler(
        ctx,
        redisInstance,
        whiteListIDs,
        ["silentOffLocale"],
        silentMessages.disabledMessageReset,
    );
});

export default silentOffLocaleReset;
