import { Composer } from "@/deps.ts";

import ListsNames from "@/constants/listsNames.ts";

import stickerMessages from "@/locales/stickerMessages.ts";

import AsyncUtils from "@/utils/asyncUtils.ts";
import RedisSingleton from "@/database/redisSingleton.ts";

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
