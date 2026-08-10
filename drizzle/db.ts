import { drizzle } from "drizzle-orm/postgres-js";

import { databaseUrl } from "./env.ts";

export const db = drizzle({
    connection: databaseUrl,
    casing: "snake_case",
    logger: process.env.NODE_ENV === "development",
});
