import { Composer } from "@/deps.ts";

import { RedisClient } from "@/database/redisClient.ts";

import otherMessages from "@/locales/otherMessages.ts";
import silentMessages from "@/locales/silentMessages.ts";
import { extractContextData } from "@/utils/asyncUtils.ts";

const silentOffLocale = new Composer();

silentOffLocale.command("silentofflocale", async (ctx) => {
    const [chatID, _, newLocaleString] = await extractContextData(
        ctx,
    );

    if (newLocaleString === "") {
        return await ctx.reply(otherMessages.stringIsEmpty);
    }

    await RedisClient.setConfigData(chatID, {
        silentOffLocale: newLocaleString,
    });

    await ctx.reply(silentMessages.disabledMessageChange);
});

export default silentOffLocale;
