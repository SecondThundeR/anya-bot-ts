import { spawn } from "node:child_process";
import { databaseUrl } from "#drizzle/env.js";
import { readTextWithLimit } from "#root/bot/helpers/general.js";
import { createPostgresToolEnv } from "#root/bot/helpers/pg-connection.js";

const MAX_STDERR_BYTES = 16 * 1024;

/**
 * Runs a PostgreSQL client tool against the configured database
 *
 * @param command Tool to run, e.g. `pg_dump`
 * @param buildArgs Receives the database name, returns the tool's arguments.
 *   Connection details must not be included - they are passed via environment
 * @returns Exit code and the (possibly truncated) stderr output
 */
export async function runPostgresTool(
    command: string,
    buildArgs: (database: string) => string[],
) {
    const { database, env } = createPostgresToolEnv(databaseUrl);

    const child = spawn(command, buildArgs(database), {
        stdio: ["ignore", "ignore", "pipe"],
        env: { ...process.env, ...env },
    });

    const exitCodePromise = new Promise<number>((resolve, reject) => {
        child.on("close", (code) => resolve(code ?? 1));
        child.on("error", (error) => reject(error));
    });

    const [exitCode, stderr] = await Promise.all([
        exitCodePromise,
        readTextWithLimit(child.stderr, MAX_STDERR_BYTES),
    ]);

    return { exitCode, stderr };
}
