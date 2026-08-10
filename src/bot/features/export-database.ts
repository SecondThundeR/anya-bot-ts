import { unlink } from "node:fs/promises";
import { Composer, InputFile } from "grammy";

import type { Context } from "#root/bot/context.js";
import { isAdmin } from "#root/bot/filter/is-admin.js";
import {
    createDumpTempFilePath,
    escapeHtml,
} from "#root/bot/helpers/general.js";
import { getUpdateInfo, logHandle } from "#root/bot/helpers/logging.js";
import { runPostgresTool } from "#root/bot/helpers/pg-tools.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private").filter(isAdmin);

feature.command("export", logHandle("command-export"), async (ctx) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = createDumpTempFilePath(`backup-${timestamp}`);

    try {
        const { exitCode, stderr } = await runPostgresTool(
            "pg_dump",
            (database) => [database, "-F", "c", "-f", backupFileName],
        );

        if (exitCode !== 0) {
            return await ctx.reply(
                ctx.t("exportMessages.dumpError", {
                    exitCode,
                    stderr: escapeHtml(stderr),
                }),
            );
        }

        await ctx.replyWithDocument(new InputFile(backupFileName));
    } catch (error: unknown) {
        ctx.logger.error({
            err: `Failed to export data from DB. Details: ${String(error)}`,
            update: getUpdateInfo(ctx),
        });
        return await ctx.reply(ctx.t("exportMessages.unknownError"));
    } finally {
        unlink(backupFileName).catch(() => {});
    }
});

export { composer as exportDatabaseFeature };
