import { Composer } from "@/deps.ts";

import SetsNames from "@/constants/setsNames.ts";

import { RedisClient } from "@/database/redisClient.ts";

import ignoreListMessages from "@/locales/ignoreListMessages.ts";

const getIgnoreList = new Composer();

getIgnoreList.command("getil", async (ctx) => {
    const ignoreListIDs = await RedisClient.getSetValues(
        SetsNames.IGNORELIST,
    );

    if (ignoreListIDs.length === 0) {
        return await ctx.reply(ignoreListMessages.idsListEmpty);
    }

    await ctx.reply(
        `${ignoreListMessages.idsListHeader}${ignoreListIDs.join("\n")}`,
    );
});

export default getIgnoreList;
