import { Composer } from "@/deps.ts";

import silentMessages from "@/locales/silentMessages.ts";

import { resetLocaleHandler } from "@/utils/asyncUtils.ts";

const silentOffLocaleReset = new Composer();

silentOffLocaleReset.command(
    "silentofflocalereset",
    async (ctx) =>
        await resetLocaleHandler(
            ctx,
            ["silentOffLocale"],
            silentMessages.disabledMessageReset,
        ),
);

export default silentOffLocaleReset;
