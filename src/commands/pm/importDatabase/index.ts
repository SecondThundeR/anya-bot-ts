import { Composer } from "@/deps.ts";

import BotContext from "@/types/context.ts";

const importDatabase = new Composer<BotContext>();

importDatabase.command(
    "import",
    async (ctx) => await ctx.conversation.enter("import"),
);

export default importDatabase;
