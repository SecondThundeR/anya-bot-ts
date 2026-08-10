import { eq, sql } from "drizzle-orm";

import { db } from "../db.ts";
import { chatsTable } from "../schema.ts";

export const getChatQuery = db
    .select({
        listStatus: chatsTable.listStatus,
        title: chatsTable.title,
        username: chatsTable.username,
        config: chatsTable.config,
    })
    .from(chatsTable)
    .where(eq(chatsTable.chatId, sql.placeholder("chatId")))
    .prepare("get_chat");

export const getChatsByListStatusQuery = db
    .select({
        chatId: chatsTable.chatId,
        title: chatsTable.title,
        username: chatsTable.username,
    })
    .from(chatsTable)
    .where(eq(chatsTable.listStatus, sql.placeholder("listStatus")))
    .prepare("get_chats_by_list_status");

export const setChatListStatusQuery = db
    .insert(chatsTable)
    .values({
        chatId: sql.placeholder("chatId"),
        listStatus: sql.placeholder("listStatus"),
    })
    .onConflictDoUpdate({
        target: chatsTable.chatId,
        set: {
            listStatus: sql`excluded.list_status`,
            updatedAt: sql`now()`,
        },
    })
    .prepare("set_chat_list_status");

export const removeChatListStatusQuery = db
    .update(chatsTable)
    .set({ listStatus: null, updatedAt: sql`now()` })
    .where(eq(chatsTable.chatId, sql.placeholder("chatId")))
    .prepare("remove_chat_list_status");
