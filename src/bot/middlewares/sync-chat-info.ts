import type { Middleware } from "grammy";

import { updateChatInfo } from "#drizzle/queries/chats.js";
import type { Context } from "#root/bot/context.js";

/**
 * Keeps the stored chat title/username snapshot fresh, so list commands
 * like /getwl don't need to resolve chats through the Telegram API.
 * Cheap on the hot path: compares against the cached row and only
 * writes when something actually changed
 */
export function syncChatInfo(): Middleware<Context> {
    return async (ctx, next) => {
        const chat = ctx.chat;
        if (chat?.type === "group" || chat?.type === "supergroup") {
            try {
                await updateChatInfo(
                    chat.id,
                    chat.title,
                    ("username" in chat ? chat.username : undefined) ?? null,
                );
            } catch (error) {
                // The snapshot is only a convenience for list commands,
                // so a failed refresh must not drop the update
                ctx.logger.warn({
                    msg: "failed to sync chat info snapshot",
                    chatId: chat.id,
                    err: error,
                });
            }
        }

        await next();
    };
}
