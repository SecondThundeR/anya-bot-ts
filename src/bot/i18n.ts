import { resolve } from "node:path";
import { cwd } from "node:process";
import { I18n } from "@grammyjs/i18n";

import type { Context } from "./context.ts";

export const i18n = new I18n<Context>({
    defaultLocale: "ru",
    directory: resolve(cwd(), "locales"),
    // No session: the bot ships a single locale and never switches it, so
    // there is nothing to negotiate or persist per user
    useSession: false,
    fluentBundleOptions: {
        useIsolating: true,
    },
});
