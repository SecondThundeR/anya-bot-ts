import { unlink } from "node:fs/promises";
import { Composer } from "grammy";

import { invalidateChatsCache } from "#drizzle/queries/chats.js";
import type { Context } from "#root/bot/context.js";
import { isAdmin } from "#root/bot/filter/is-admin.js";
import { downloadTelegramFileToPath } from "#root/bot/helpers/api.js";
import {
    createDumpTempFilePath,
    escapeHtml,
} from "#root/bot/helpers/general.js";
import { logHandle } from "#root/bot/helpers/logging.js";
import { runPostgresTool } from "#root/bot/helpers/pg-tools.js";
import {
    createImportConfirmationKeyboard,
    IMPORT_CANCEL_DATA,
    IMPORT_CONFIRM_DATA,
} from "#root/bot/keyboards/import-confirmation.js";
import { startRestore, takeRestore } from "#root/bot/store/pending-restores.js";

const IMPORT_CONFIRMATION_WAIT_MS = 2 * 60 * 1000;

const composer = new Composer<Context>();

const feature = composer.chatType("private").filter(isAdmin);

/**
 * Checks that the document looks like a `pg_dump -F c` archive.
 *
 * The extension is the real signal; the MIME type is only checked when
 * Telegram provides one, since it may be absent for binary uploads
 */
function isBackupDocument(fileName?: string, mimeType?: string) {
    const hasDumpExtension = fileName?.endsWith(".dump") ?? false;
    const hasBinaryMime =
        mimeType === undefined || mimeType === "application/octet-stream";

    return hasDumpExtension && hasBinaryMime;
}

feature.on("msg:document", logHandle("handler-import-file"), async (ctx) => {
    const { file_id, file_name, mime_type } = ctx.msg.document;

    if (!isBackupDocument(file_name, mime_type)) {
        return await ctx.reply(ctx.t("importMessages.wrongFormat"));
    }

    // Restoring replaces the entire database, so an uploaded file never acts on
    // its own - it waits here for an explicit confirmation
    startRestore(
        ctx.from.id,
        file_id,
        IMPORT_CONFIRMATION_WAIT_MS,
        () => void 0,
    );

    await ctx.reply(ctx.t("importMessages.confirmation"), {
        reply_markup: createImportConfirmationKeyboard(ctx),
        reply_parameters: { message_id: ctx.msg.message_id },
    });
});

feature.callbackQuery(
    IMPORT_CANCEL_DATA,
    logHandle("handler-import-cancel"),
    async (ctx) => {
        takeRestore(ctx.from.id);

        await ctx.answerCallbackQuery();
        await ctx.editMessageText(ctx.t("importMessages.cancelled"));
    },
);

feature.callbackQuery(
    IMPORT_CONFIRM_DATA,
    logHandle("handler-import-confirm"),
    async (ctx) => {
        const fileID = takeRestore(ctx.from.id);

        if (fileID === null) {
            await ctx.answerCallbackQuery();
            return await ctx.editMessageText(ctx.t("importMessages.expired"));
        }

        await ctx.answerCallbackQuery();
        await restoreFromFile(ctx, fileID);
    },
);

async function restoreFromFile(ctx: Context, fileID: string) {
    let restoreFileName: string | null = null;
    let message: Awaited<ReturnType<typeof ctx.reply>> | null = null;

    try {
        message = await ctx.reply(ctx.t("importMessages.inProgress"));

        const fileData = await ctx.api.getFile(fileID);
        if (!fileData.file_path) {
            throw new Error("Backup file path is missing");
        }

        const dumpPath = createDumpTempFilePath("restore");
        restoreFileName = dumpPath;

        const downloadStatus = await downloadTelegramFileToPath(
            fileData.file_path,
            dumpPath,
            ctx.config.botToken,
        );

        if (!downloadStatus) {
            throw new Error("Failed to download backup file");
        }

        // -d is required: without it pg_restore writes a script to stdout
        // instead of restoring into the database
        const { exitCode, stderr } = await runPostgresTool(
            "pg_restore",
            (database) => [
                "-d",
                database,
                "--single-transaction",
                "--clean",
                "--if-exists",
                "--no-owner",
                dumpPath,
            ],
        );

        if (exitCode !== 0) {
            throw new Error(
                `pg_restore failed with exit code ${exitCode}:\n${stderr}`,
            );
        }

        // pg_restore bypasses the repository layer, so cached rows are stale now
        invalidateChatsCache();

        return await message.editText(ctx.t("importMessages.success"));
    } catch (error) {
        ctx.logger.error({
            msg: "Import failed. Rollback has been completed",
            error,
        });

        const errorMessage =
            error instanceof Error
                ? ctx.t("importMessages.error", {
                      errorMessage: escapeHtml(error.message),
                  })
                : ctx.t("importMessages.unknownError");

        if (message) {
            return await message.editText(errorMessage);
        }
        return await ctx.reply(errorMessage);
    } finally {
        if (restoreFileName) {
            unlink(restoreFileName).catch(() => {});
        }
    }
}

export { composer as importFileFeature };
