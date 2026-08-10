import * as v from "valibot";

/**
 * Loads the `.env` file and validates the variables the database layer needs.
 *
 * This lives apart from `src/config.ts` on purpose. Module evaluation order in
 * ESM follows the import graph, and `drizzle/db.ts` is pulled in before
 * `src/config.ts`: if `.env` were loaded there, the database URL would still be
 * `undefined` by the time the connection is created, and postgres-js would
 * silently fall back to its own defaults instead of failing.
 *
 * Keeping it separate also lets `drizzle/migrate.ts` run with only
 * `DATABASE_URL` set, without requiring the bot's own configuration.
 *
 * It lives under `drizzle/` rather than `src/` because the release image ships
 * `dist/` and `drizzle/` but not `src/`: migrations run from this folder as
 * TypeScript, so everything `migrate.ts` reaches has to be here too
 */

try {
    process.loadEnvFile();
} catch {
    // No .env file found - the environment is expected to provide the variables
}

const environmentSchema = v.object({
    databaseUrl: v.pipe(
        v.string("DATABASE_URL is not set"),
        v.nonEmpty("DATABASE_URL is empty"),
    ),
});

function parseEnvironment() {
    try {
        return v.parse(environmentSchema, {
            databaseUrl: process.env.DATABASE_URL,
        });
    } catch (error) {
        throw new Error("Invalid database environment", { cause: error });
    }
}

export const { databaseUrl } = parseEnvironment();
