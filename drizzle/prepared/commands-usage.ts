import { desc, sql } from "drizzle-orm";

import { db } from "../db.ts";
import { commandsUsageTable } from "../schema.ts";

export const incrementCommandUsageQuery = db
    .insert(commandsUsageTable)
    .values({ command: sql.placeholder("command"), count: 1 })
    .onConflictDoUpdate({
        target: commandsUsageTable.command,
        set: { count: sql`${commandsUsageTable.count} + 1` },
    })
    .prepare("increment_command_usage");

export const getAllCommandsUsageQuery = db
    .select()
    .from(commandsUsageTable)
    .orderBy(desc(commandsUsageTable.count))
    .prepare("get_all_commands_usage");
