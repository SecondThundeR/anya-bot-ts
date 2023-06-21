import { Composer } from "@/deps.ts";

import silentMessages from "@/locales/silentMessages.ts";

import { resetLocaleHandler } from "@/utils/asyncUtils.ts";

const silentOnLocaleReset = new Composer();

silentOnLocaleReset.command(
    "silentonlocalereset",
    async (ctx) =>
        await resetLocaleHandler(
            ctx,
            ["silentOnLocale"],
            silentMessages.enabledMessageReset,
        ),
);

export default silentOnLocaleReset;
