import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isNotAdminCommand } from "#root/bot/middlewares/check-for-admin-command.js";

describe("isNotAdminCommand", () => {
    it("recognises a bare admin command", () => {
        assert.equal(isNotAdminCommand("/silent"), false);
        assert.equal(isNotAdminCommand("/adminpower"), false);
    });

    it("strips the bot username suffix", () => {
        assert.equal(isNotAdminCommand("/silent@anya_bot"), false);
        assert.equal(isNotAdminCommand("/help@some_other_bot"), false);
    });

    it("does not confuse commands sharing a prefix", () => {
        assert.equal(isNotAdminCommand("/silentonlocale"), false);
        assert.equal(isNotAdminCommand("/silentonlocalereset"), false);
    });

    it("treats regular commands as non-admin", () => {
        assert.equal(isNotAdminCommand("/dice"), true);
        assert.equal(isNotAdminCommand("/uptime"), true);
    });

    it("treats unknown and malformed input as non-admin", () => {
        assert.equal(isNotAdminCommand("/nonexistent"), true);
        assert.equal(isNotAdminCommand(""), true);
        assert.equal(isNotAdminCommand("@anya_bot"), true);
    });
});
