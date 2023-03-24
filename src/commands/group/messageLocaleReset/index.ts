import { Composer } from "@/deps.ts";

import ListsNames from "@/data/listsNames.ts";

import stickerMessages from "@/locale/stickerMessages.ts";

import AsyncUtils from "@/utils/asyncUtils.ts";
import RedisSingleton from "@/utils/redisSingleton.ts";

const messageLocaleReset = new Composer();

messageLocaleReset.command("messagelocalereset", async (ctx) => {
    const redisInstance = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(
        redisInstance,
        "messagelocalereset",
    );

    if (await AsyncUtils.isCommandIgnored(ctx, redisInstance)) return;

    const whiteListIDs = await redisInstance.getList(ListsNames.WHITELIST);

    await AsyncUtils.resetLocaleHandler(
        ctx,
        redisInstance,
        whiteListIDs,
        ["stickerMessageLocale", "stickerMessageMention"],
        stickerMessages.messageReset,
    );
});

export default messageLocaleReset;
