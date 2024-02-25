import { Composer } from "@/deps.ts";

import { DB_DATA_TYPE, RedisClient } from "@/database/redisClient.ts";

export const importFileHandler = new Composer();

importFileHandler.on("message:file", async (ctx) => {
    const document = ctx.msg.document;

    if (document?.mime_type !== "application/json") {
        return void await ctx.reply(
            "Неверный формат файла. Необходимо отправить JSON-файл",
        );
    }

    const fileData = await ctx.getFile();
    const fileURL = `https://api.telegram.org/file/bot${
        Deno.env.get("BOT_TOKEN")
    }/${fileData.file_path}`;

    const fileResponse = await fetch(fileURL);
    const dataJSON: Record<string, DB_DATA_TYPE> = await fileResponse.json();
    await RedisClient.importDatabase(dataJSON);

    await ctx.reply("Успешно импортировано!");
});
