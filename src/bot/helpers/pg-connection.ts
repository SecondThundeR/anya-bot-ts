/**
 * Translates a connection URL into the environment variables `pg_dump` and
 * `pg_restore` understand, plus the bare database name the tools take as an
 * argument.
 *
 * Passing the URL on the command line would expose the password to anything
 * that can read the process list, and it tends to resurface in the tool's
 * stderr, which is forwarded to the admin
 *
 * @param url PostgreSQL connection URL
 * @returns Database name and the environment to run the tool with
 */
export function createPostgresToolEnv(url: string) {
    const parsed = new URL(url);
    const sslMode = parsed.searchParams.get("sslmode");
    const database = decodeURIComponent(parsed.pathname.slice(1));

    return {
        database,
        env: {
            PGHOST: parsed.hostname,
            PGPORT: parsed.port || "5432",
            PGUSER: decodeURIComponent(parsed.username),
            PGPASSWORD: decodeURIComponent(parsed.password),
            PGDATABASE: database,
            ...(sslMode ? { PGSSLMODE: sslMode } : {}),
        },
    };
}
