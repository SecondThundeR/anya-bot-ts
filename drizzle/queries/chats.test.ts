import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
    buildChatConfigFlagToggle,
    buildChatConfigUpdate,
} from "#drizzle/queries/chats.js";

/**
 * These assert the SQL drizzle generates, without touching a database.
 * The JSONB patching is the least obvious part of the data layer: a wrong
 * operator silently drops or keeps chat settings instead of failing loudly
 */

describe("buildChatConfigUpdate", () => {
    it("merges the values it sets and creates the row when missing", () => {
        const { sql, params } = buildChatConfigUpdate(-100, {
            isSilent: true,
        }).toSQL();

        assert.match(sql, /insert into "chats"/);
        assert.match(sql, /on conflict \("chat_id"\) do update set/);
        assert.match(sql, /"config" = "chats"\."config" \|\| \$\d+::jsonb/);
        assert.match(sql, /"updated_at" = now\(\)/);
        assert.ok(params.includes('{"isSilent":true}'));
    });

    it("drops keys set to null with the - operator", () => {
        const { sql, params } = buildChatConfigUpdate(-100, {
            stickerMessageLocale: null,
        }).toSQL();

        assert.match(
            sql,
            /"config" = "chats"\."config" - \$\d+::text \|\| \$\d+::jsonb/,
        );
        assert.ok(params.includes("stickerMessageLocale"));
        // Nothing is merged in, so the row is created with an empty config
        assert.ok(params.includes("{}"));
    });

    it("drops every null key in a mixed patch", () => {
        const { sql, params } = buildChatConfigUpdate(-100, {
            stickerMessageLocale: null,
            stickerMessageMention: null,
            isSilent: true,
        }).toSQL();

        assert.match(
            sql,
            /"config" - \$\d+::text - \$\d+::text \|\| \$\d+::jsonb/,
        );
        assert.ok(params.includes("stickerMessageLocale"));
        assert.ok(params.includes("stickerMessageMention"));
        assert.ok(params.includes('{"isSilent":true}'));
    });

    it("treats undefined like null", () => {
        const { sql, params } = buildChatConfigUpdate(-100, {
            silentOnLocale: undefined,
        }).toSQL();

        assert.match(sql, /"config" - \$\d+::text/);
        assert.ok(params.includes("silentOnLocale"));
    });
});

describe("buildChatConfigFlagToggle", () => {
    it("flips the flag in a single statement and returns the new value", () => {
        const { sql, params } = buildChatConfigFlagToggle(
            -100,
            "isSilent",
        ).toSQL();

        assert.match(sql, /jsonb_build_object/);
        assert.match(sql, /NOT COALESCE/);
        assert.match(sql, /returning/);
        assert.ok(params.includes("isSilent"));
    });

    it("creates the row with the flag enabled", () => {
        const { params } = buildChatConfigFlagToggle(-100, "aidenMode").toSQL();

        assert.ok(params.includes('{"aidenMode":true}'));
    });
});
