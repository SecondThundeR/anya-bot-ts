import { eq, type SQL, sql } from "drizzle-orm";

import { db } from "../db.ts";
import {
    getChatQuery,
    getChatsByListStatusQuery,
    removeChatListStatusQuery,
    setChatListStatusQuery,
} from "../prepared/chats.ts";
import {
    type ChatConfig,
    type ChatListStatus,
    chatsTable,
    type SelectChat,
} from "../schema.ts";

/**
 * Partial config update: `null` (or `undefined`) removes the key from the
 * JSONB object, resetting the setting to its default
 */
export type ChatConfigPatch = {
    [K in keyof ChatConfig]?: ChatConfig[K] | null;
};

export const BOOLEAN_CONFIG_FIELDS = [
    "adminPower",
    "aidenMode",
    "isAidenSilent",
    "isSilent",
    "strictEmojiRemoval",
    "stickerMessageMention",
] as const satisfies (keyof ChatConfig)[];

export type BooleanConfigField = (typeof BOOLEAN_CONFIG_FIELDS)[number];

export type ChatRow = Pick<
    SelectChat,
    "listStatus" | "title" | "username" | "config"
>;

export type ChatListEntry = {
    chatId: string;
    title: string | null;
    username: string | null;
};

const CHAT_CACHE_TTL_MS = 5 * 60 * 1000;
const CHAT_CACHE_MAX_SIZE = 1024;

type ChatCacheEntry = {
    expiresAt: number;
    // null caches "chat has no row" so unknown chats don't hit the DB per message
    row: ChatRow | null;
};

// Single-writer assumption: every chat write goes through this module
// (plus /import's pg_restore, which must call invalidateChatsCache()),
// so entries only go stale from manual external edits, bounded by the TTL
const chatsCache = new Map<number, ChatCacheEntry>();

function readCachedChat(chatId: number) {
    const entry = chatsCache.get(chatId);
    if (!entry) return undefined;

    if (entry.expiresAt <= Date.now()) {
        chatsCache.delete(chatId);
        return undefined;
    }

    return entry.row;
}

function cacheChat(chatId: number, row: ChatRow | null) {
    if (chatsCache.size >= CHAT_CACHE_MAX_SIZE) {
        const now = Date.now();
        for (const [key, entry] of chatsCache) {
            if (entry.expiresAt <= now) chatsCache.delete(key);
        }

        // Sweeping only drops expired entries, so a bot active in more than
        // CHAT_CACHE_MAX_SIZE chats would grow the map without bound. Evict the
        // least recently cached entries to hold the ceiling
        for (const key of chatsCache.keys()) {
            if (chatsCache.size < CHAT_CACHE_MAX_SIZE) break;
            chatsCache.delete(key);
        }
    }

    // Re-insert so the entry moves to the end of the eviction order
    chatsCache.delete(chatId);
    chatsCache.set(chatId, {
        expiresAt: Date.now() + CHAT_CACHE_TTL_MS,
        row,
    });
}

/** Drops the cached row for one chat, or the whole cache when called without arguments */
export function invalidateChatsCache(chatId?: number) {
    if (chatId === undefined) {
        chatsCache.clear();
    } else {
        chatsCache.delete(chatId);
    }
}

async function getChatRow(chatId: number): Promise<ChatRow | null> {
    const cached = readCachedChat(chatId);
    if (cached !== undefined) return cached;

    const rows = await getChatQuery.execute({ chatId });
    const row = rows.at(0) ?? null;
    cacheChat(chatId, row);
    return row;
}

export async function getChatConfig(
    chatId: number,
): Promise<ChatConfig | undefined> {
    return (await getChatRow(chatId))?.config;
}

export async function getChatListStatus(
    chatId: number,
): Promise<ChatListStatus | null> {
    return (await getChatRow(chatId))?.listStatus ?? null;
}

export async function getChatsByListStatus(
    listStatus: ChatListStatus,
): Promise<ChatListEntry[]> {
    const rows = await getChatsByListStatusQuery.execute({ listStatus });
    return rows.map((row) => ({ ...row, chatId: String(row.chatId) }));
}

/**
 * Refreshes the stored chat info snapshot when it changed.
 * Chats without a row (not listed and never configured) are skipped
 */
export async function updateChatInfo(
    chatId: number,
    title: string | null,
    username: string | null,
) {
    const row = await getChatRow(chatId);
    if (!row || (row.title === title && row.username === username)) return;

    await db
        .update(chatsTable)
        .set({ title, username, updatedAt: sql`now()` })
        .where(eq(chatsTable.chatId, chatId));
    invalidateChatsCache(chatId);
}

export async function setChatListStatus(
    chatId: number,
    listStatus: ChatListStatus,
) {
    await setChatListStatusQuery.execute({ chatId, listStatus });
    invalidateChatsCache(chatId);
}

export async function removeChatListStatus(chatId: number) {
    await removeChatListStatusQuery.execute({ chatId });
    invalidateChatsCache(chatId);
}

/**
 * Builds the upsert behind {@link updateChatConfig}.
 *
 * Kept separate so the generated SQL can be asserted without a database:
 * keys set to null must be dropped from the JSONB object with `-`, the rest
 * merged with `||`, and the row created when it does not exist yet
 */
export function buildChatConfigUpdate(chatId: number, patch: ChatConfigPatch) {
    const setValues: ChatConfig = {};
    const removeKeys: (keyof ChatConfig)[] = [];

    for (const key of Object.keys(patch) as (keyof ChatConfig)[]) {
        const value = patch[key];
        if (value === null || value === undefined) {
            removeKeys.push(key);
        } else {
            // biome-ignore lint/suspicious/noExplicitAny: key and value types are tied by ChatConfigPatch
            (setValues as Record<string, any>)[key] = value;
        }
    }

    let configUpdate: SQL = sql`${chatsTable.config}`;
    for (const key of removeKeys) {
        configUpdate = sql`${configUpdate} - ${key}::text`;
    }
    configUpdate = sql`${configUpdate} || ${JSON.stringify(setValues)}::jsonb`;

    return db
        .insert(chatsTable)
        .values({ chatId, config: setValues })
        .onConflictDoUpdate({
            target: chatsTable.chatId,
            set: { config: configUpdate, updatedAt: sql`now()` },
        });
}

export async function updateChatConfig(chatId: number, patch: ChatConfigPatch) {
    await buildChatConfigUpdate(chatId, patch);
    invalidateChatsCache(chatId);
}

/**
 * Atomically flips a boolean config flag for a chat,
 * creating the row (with the flag enabled) if it doesn't exist yet
 *
 * @returns New value of the flag
 */
export function buildChatConfigFlagToggle(
    chatId: number,
    field: BooleanConfigField,
) {
    return db
        .insert(chatsTable)
        .values({ chatId, config: { [field]: true } })
        .onConflictDoUpdate({
            target: chatsTable.chatId,
            set: {
                config: sql`${chatsTable.config} || jsonb_build_object(${field}::text, NOT COALESCE((${chatsTable.config}->>${field}::text)::boolean, false))`,
                updatedAt: sql`now()`,
            },
        })
        .returning({
            value: sql<boolean>`(${chatsTable.config}->>${field}::text)::boolean`,
        });
}

export async function toggleChatConfigFlag(
    chatId: number,
    field: BooleanConfigField,
): Promise<boolean> {
    const rows = await buildChatConfigFlagToggle(chatId, field);
    invalidateChatsCache(chatId);
    return rows.at(0)?.value ?? false;
}

export type { ChatConfig, ChatListStatus, SelectChat };
