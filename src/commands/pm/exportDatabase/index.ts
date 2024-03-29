import { Composer, InputFile } from "@/deps.ts";

import { RedisClient } from "@/database/redisClient.ts";

const exportDatabase = new Composer();

exportDatabase.command("export", async (ctx) => {
    const exportFileName = `export-${Date.now()}.json`;
    const exportJSON = await RedisClient.exportDatabase();

    await Deno.writeTextFile(exportFileName, exportJSON);
    await ctx.replyWithDocument(new InputFile(exportFileName));

    await Deno.remove(exportFileName);
});

export default exportDatabase;
