import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createPostgresToolEnv } from "#root/bot/helpers/pg-connection.js";

describe("createPostgresToolEnv", () => {
    it("maps every connection part to a PG* variable", () => {
        const { database, env } = createPostgresToolEnv(
            "postgres://bot:secret@db.example.com:6432/anya",
        );

        assert.equal(database, "anya");
        assert.deepEqual(env, {
            PGHOST: "db.example.com",
            PGPORT: "6432",
            PGUSER: "bot",
            PGPASSWORD: "secret",
            PGDATABASE: "anya",
        });
    });

    it("falls back to the default port", () => {
        const { env } = createPostgresToolEnv("postgres://u:p@host/db");
        assert.equal(env.PGPORT, "5432");
    });

    it("decodes percent-encoded credentials", () => {
        const { env } = createPostgresToolEnv(
            "postgres://a%40b:p%40ss%3Aword@host/db",
        );

        assert.equal(env.PGUSER, "a@b");
        assert.equal(env.PGPASSWORD, "p@ss:word");
    });

    it("carries sslmode over when present", () => {
        const { env } = createPostgresToolEnv(
            "postgres://u:p@host/db?sslmode=require",
        );
        assert.equal(env.PGSSLMODE, "require");
    });

    it("omits sslmode when the URL has none", () => {
        const { env } = createPostgresToolEnv("postgres://u:p@host/db");
        assert.ok(!("PGSSLMODE" in env));
    });
});
