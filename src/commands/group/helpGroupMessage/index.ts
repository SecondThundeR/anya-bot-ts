import { Composer } from "@/deps.ts";

import helpMessages from "@/locale/helpMessages.ts";

import AsyncUtils from "@/utils/asyncUtils.ts";
import RedisSingleton from "@/database/redisSingleton.ts";
import RegularUtils from "@/utils/regularUtils.ts";

import { isHelpIgnored } from "@/groupCommands/helpGroupMessage/helpers.ts";

const helpGroupMessage = new Composer();

helpGroupMessage.command("help", async (ctx) => {
    const redisInstance = RedisSingleton.getInstance();
    await AsyncUtils.incrementCommandUsageCounter(redisInstance, "help");

    if (await isHelpIgnored(ctx, redisInstance)) return;

    await ctx.reply(
        RegularUtils.convertHelpMessageToHTMLFormat(helpMessages.groupMessage),
        {
            parse_mode: "HTML",
        },
    );
});

export default helpGroupMessage;
