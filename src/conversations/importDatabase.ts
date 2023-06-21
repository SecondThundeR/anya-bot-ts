import redisClient, { DB_DATA_TYPE } from "@/database/redisClient.ts";

import BotContext from "@/types/context.ts";
import BotConversation from "@/types/conversation.ts";

const WAIT_FOR_TIMEOUT_MS = 30000;

async function importDatabase(conversation: BotConversation, ctx: BotContext) {
    await ctx.reply(
        `Для импортирования, отправьте JSON-файл с данными. Импорт автоматически отменится через ${
            WAIT_FOR_TIMEOUT_MS / 1000
        } секунд`,
    );

    const { msg: { document } } = await conversation.waitFor(
        "message:file",
        {
            maxMilliseconds: WAIT_FOR_TIMEOUT_MS,
        },
    );
    if (document?.mime_type !== "application/json") {
        await ctx.reply(
            "Неверный формат файла. Необходимо отправить JSON-файл",
        );
        return;
    }

    const importFileID = document?.file_id;
    const fileData = await ctx.api.getFile(importFileID);
    const fileURL = `https://api.telegram.org/file/bot${
        Deno.env.get("BOT_TOKEN")
    }/${fileData.file_path}`;

    const fileResponse = await fetch(fileURL);
    const dataJSON: Record<string, DB_DATA_TYPE> = await fileResponse.json();

    await redisClient.importDatabase(dataJSON);
    await ctx.reply("Успешно импортировано!");
}

export default importDatabase;
