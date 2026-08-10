import { index, pgEnum, pgTable } from "drizzle-orm/pg-core";

import { COMMAND_NAME_LENGTH } from "./constraints.ts";

export const chatListStatusEnum = pgEnum("chat_list_status", [
    "whitelisted",
    "ignored",
]);

export type ChatListStatus = (typeof chatListStatusEnum.enumValues)[number];

/**
 * Chat feature settings stored as a sparse JSONB object: a missing key means
 * "use the default" (false for booleans, default locale string for texts),
 * and resetting a setting removes its key. New settings only need a new
 * optional property here, no migration
 */
export interface ChatConfig {
    adminPower?: boolean;
    aidenMode?: boolean;
    isAidenSilent?: boolean;
    isSilent?: boolean;
    strictEmojiRemoval?: boolean;
    stickerMessageMention?: boolean;
    stickerMessageLocale?: string;
    silentOnLocale?: string;
    silentOffLocale?: string;
}

export const chatsTable = pgTable(
    "chats",
    (t) => ({
        chatId: t.bigint({ mode: "number" }).primaryKey(),
        // Nullable on purpose: a chat removed from both lists keeps its config,
        // mirroring the old Redis behavior where the config hash outlived set membership
        listStatus: chatListStatusEnum(),
        // Opportunistic snapshot of the Telegram chat info, refreshed by
        // middleware so list commands don't need to hit the Telegram API
        title: t.text(),
        username: t.text(),
        config: t.jsonb().$type<ChatConfig>().notNull().default({}),
        createdAt: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
        updatedAt: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
    }),
    (table) => [index().on(table.listStatus)],
);

export type InsertChat = typeof chatsTable.$inferInsert;
export type SelectChat = typeof chatsTable.$inferSelect;

export const commandsUsageTable = pgTable("commands_usage", (t) => ({
    command: t.varchar({ length: COMMAND_NAME_LENGTH }).primaryKey(),
    count: t.integer().notNull().default(0),
}));

export type InsertCommandUsage = typeof commandsUsageTable.$inferInsert;
export type SelectCommandUsage = typeof commandsUsageTable.$inferSelect;
