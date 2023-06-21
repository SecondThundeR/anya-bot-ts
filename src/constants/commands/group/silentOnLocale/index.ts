import { Composer } from "@/deps.ts";

import redisClient from "@/database/redisClient.ts";

import otherMessages from "@/locales/otherMessages.ts";
import silentMessages from "@/locales/silentMessages.ts";

import { extractContextData } from "@/utils/asyncUtils.ts";

const silentOnLocale = new Composer();

silentOnLocale.command("silentonlocale", async (ctx) => {
    const [chatID, _, newLocaleString] = await extractContextData(
        ctx,
    );

    if (newLocaleString === "") {
        return await ctx.reply(otherMessages.stringIsEmpty);
    }

    await redisClient.setConfigData(chatID, {
        silentOnLocale: newLocaleString,
    });

    await ctx.reply(silentMessages.enabledMessageChange);
});

export default silentOnLocale;