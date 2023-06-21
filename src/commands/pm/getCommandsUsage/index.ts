import { Composer } from "@/deps.ts";

import AsyncUtils from "@/utils/asyncUtils.ts";
import RedisSingleton from "@/database/redisSingleton.ts";
import RegularUtils from "@/utils/regularUtils.ts";

const getCommandsUsage = new Composer();

getCommandsUsage.command("getcommandsusage", async (ctx) => {
    if (!RegularUtils.isBotCreator(ctx)) return;

    const data = await AsyncUtils.getCommandsUsage(
        RedisSingleton.getInstance(),
    );
    if (Object.keys(data).length === 0) {
        return await ctx.reply("Нет данных по использованию команд");
    }

    let formattedData = "";
    for (let i = 0; i < data.length; i += 2) {
        formattedData += `${data[i]}: ${data[i + 1]} раз(а)\n`;
    }

    await ctx.reply("Данные по использованию команд:\n" + formattedData);
});

export default getCommandsUsage;
