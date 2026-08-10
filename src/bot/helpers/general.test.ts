import assert from "node:assert/strict";
import { basename } from "node:path";
import { Readable } from "node:stream";
import { describe, it } from "node:test";

import { NICKNAME_CHARS } from "#root/bot/constants/nickname-chars.js";
import type { Context } from "#root/bot/context.js";
import {
    createDumpTempFilePath,
    escapeHtml,
    generateNickname,
    getChatLink,
    getStickerMessageLocale,
    idsToCodeBlocks,
    parseDiceCommand,
    parseStickerMentionCallback,
    readTextWithLimit,
    verifyLocaleWord,
    verifyStickerMessageLocale,
} from "#root/bot/helpers/general.js";

const DEFAULT_STICKER_TEXT = "default sticker text";

const ctxStub = {
    t: () => DEFAULT_STICKER_TEXT,
} as unknown as Context;

describe("escapeHtml", () => {
    it("escapes the characters Telegram treats as markup", () => {
        assert.equal(escapeHtml("<b>bold</b>"), "&lt;b&gt;bold&lt;/b&gt;");
        assert.equal(escapeHtml("Tom & Jerry"), "Tom &amp; Jerry");
    });

    it("escapes ampersands before angle brackets to avoid double-escaping", () => {
        assert.equal(escapeHtml("&lt;"), "&amp;lt;");
    });

    it("leaves plain text untouched", () => {
        assert.equal(escapeHtml("обычный текст"), "обычный текст");
        assert.equal(escapeHtml(""), "");
    });
});

describe("getStickerMessageLocale", () => {
    it("prepends the mention when mention mode is on", () => {
        assert.equal(
            getStickerMessageLocale("no stickers", true, "@user"),
            "@user, no stickers",
        );
    });

    it("returns bare text when mention mode is off", () => {
        assert.equal(
            getStickerMessageLocale("no stickers", false, "@user"),
            "no stickers",
        );
    });
});

describe("getChatLink", () => {
    it("formats a username as a link", () => {
        assert.equal(getChatLink("somechat"), "@somechat");
    });

    it("returns undefined without a username", () => {
        assert.equal(getChatLink(undefined), undefined);
        assert.equal(getChatLink(""), undefined);
    });
});

describe("verifyLocaleWord", () => {
    it("falls back to the default for null and empty words", () => {
        assert.equal(verifyLocaleWord(null, "default"), "default");
        assert.equal(verifyLocaleWord("", "default"), "default");
    });

    it("keeps a custom word", () => {
        assert.equal(verifyLocaleWord("custom", "default"), "custom");
    });
});

describe("verifyStickerMessageLocale", () => {
    it("forces the mention on for the default text", () => {
        assert.deepEqual(verifyStickerMessageLocale(ctxStub, null, false), [
            DEFAULT_STICKER_TEXT,
            true,
        ]);
    });

    it("keeps the configured mention mode for custom text", () => {
        assert.deepEqual(verifyStickerMessageLocale(ctxStub, "custom", false), [
            "custom",
            false,
        ]);
        assert.deepEqual(verifyStickerMessageLocale(ctxStub, "custom", true), [
            "custom",
            true,
        ]);
    });

    it("escapes custom text but keeps the locale default verbatim", () => {
        assert.deepEqual(verifyStickerMessageLocale(ctxStub, "<b>x", false), [
            "&lt;b&gt;x",
            false,
        ]);
        assert.deepEqual(verifyStickerMessageLocale(ctxStub, null, false), [
            DEFAULT_STICKER_TEXT,
            true,
        ]);
    });
});

describe("generateNickname", () => {
    it("respects the requested length and allowed characters", () => {
        const nickname = generateNickname(12);
        assert.equal(nickname.length, 12);
        for (const char of nickname) {
            assert.ok(NICKNAME_CHARS.includes(char));
        }
    });

    it("defaults to 8 characters", () => {
        assert.equal(generateNickname().length, 8);
    });
});

describe("idsToCodeBlocks", () => {
    it("wraps every ID in a code block on its own line", () => {
        assert.equal(
            idsToCodeBlocks(["-100", "-200"]),
            "<code>-100</code>\n<code>-200</code>",
        );
    });

    it("returns an empty string for no IDs", () => {
        assert.equal(idsToCodeBlocks([]), "");
    });

    it("escapes the IDs it wraps", () => {
        assert.equal(idsToCodeBlocks(["<x>"]), "<code>&lt;x&gt;</code>");
    });
});

describe("createDumpTempFilePath", () => {
    it("creates unique .dump paths with the given prefix", () => {
        const first = createDumpTempFilePath("backup");
        const second = createDumpTempFilePath("backup");
        assert.ok(basename(first).startsWith("backup-"));
        assert.ok(first.endsWith(".dump"));
        assert.notEqual(first, second);
    });
});

describe("readTextWithLimit", () => {
    it("reads a stream fully when under the limit", async () => {
        const stream = Readable.from([Buffer.from("hello "), "world"]);
        assert.equal(await readTextWithLimit(stream, 1024), "hello world");
    });

    it("truncates output beyond the byte limit", async () => {
        const stream = Readable.from([Buffer.from("abcdefgh")]);
        assert.equal(
            await readTextWithLimit(stream, 4),
            "abcd\n... stderr output truncated",
        );
    });

    it("returns an empty string for a missing stream", async () => {
        assert.equal(await readTextWithLimit(null, 1024), "");
    });
});

describe("parseDiceCommand", () => {
    it("parses a number followed by text", () => {
        assert.deepEqual(parseDiceCommand("3 пьет чай"), {
            status: "ok",
            number: 3,
            text: "пьет чай",
        });
    });

    it("reports an empty argument list", () => {
        assert.equal(parseDiceCommand("").status, "empty");
        assert.equal(parseDiceCommand("   ").status, "empty");
    });

    it("reports a missing text", () => {
        assert.equal(parseDiceCommand("3").status, "noText");
        assert.equal(parseDiceCommand("  3  ").status, "noText");
    });

    it("reports a non-numeric first argument", () => {
        assert.equal(parseDiceCommand("abc text").status, "notANumber");
    });

    it("reports numbers outside the dice range", () => {
        assert.equal(parseDiceCommand("0 text").status, "wrongNumber");
        assert.equal(parseDiceCommand("7 text").status, "wrongNumber");
        assert.equal(parseDiceCommand("-1 text").status, "wrongNumber");
    });

    it("accepts both range bounds", () => {
        assert.equal(parseDiceCommand("1 text").status, "ok");
        assert.equal(parseDiceCommand("6 text").status, "ok");
    });

    it("collapses runs of whitespace between the number and the text", () => {
        assert.deepEqual(parseDiceCommand("2    a  b"), {
            status: "ok",
            number: 2,
            text: "a b",
        });
    });
});

describe("parseStickerMentionCallback", () => {
    it("parses a well-formed payload", () => {
        assert.deepEqual(parseStickerMentionCallback("123|-100456|yes"), {
            userID: "123",
            chatID: "-100456",
            isMentionMode: true,
        });
    });

    it('treats anything but "yes" as mention mode off', () => {
        assert.equal(
            parseStickerMentionCallback("123|-100456|no")?.isMentionMode,
            false,
        );
        assert.equal(
            parseStickerMentionCallback("123|-100456|")?.isMentionMode,
            false,
        );
    });

    it("rejects payloads with the wrong number of parts", () => {
        assert.equal(parseStickerMentionCallback("123|-100456"), null);
        assert.equal(
            parseStickerMentionCallback("123|-100456|yes|extra"),
            null,
        );
        assert.equal(parseStickerMentionCallback(""), null);
    });
});
