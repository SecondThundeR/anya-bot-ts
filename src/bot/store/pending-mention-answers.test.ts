import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { setTimeout as delay } from "node:timers/promises";

import {
    isMentionAnswerPending,
    startMentionAnswerWait,
    takeMentionAnswerWait,
} from "#root/bot/store/pending-mention-answers.js";

const LONG_TIMEOUT_MS = 60_000;

describe("pending mention answers", () => {
    it("tracks pending questions per chat", () => {
        assert.equal(isMentionAnswerPending(-100), false);

        startMentionAnswerWait(-100, LONG_TIMEOUT_MS, () => {});
        assert.equal(isMentionAnswerPending(-100), true);
        assert.equal(isMentionAnswerPending(-200), false);

        assert.equal(takeMentionAnswerWait(-100), true);
        assert.equal(isMentionAnswerPending(-100), false);
    });

    it("reports nothing pending once the question is claimed", () => {
        assert.equal(takeMentionAnswerWait(-300), false);

        startMentionAnswerWait(-300, LONG_TIMEOUT_MS, () => {});
        assert.equal(takeMentionAnswerWait(-300), true);
        assert.equal(takeMentionAnswerWait(-300), false);
    });

    it("runs the timeout callback and drops the question", async () => {
        let timedOut = false;
        startMentionAnswerWait(-400, 1, () => {
            timedOut = true;
        });

        await delay(20);

        assert.equal(timedOut, true);
        assert.equal(isMentionAnswerPending(-400), false);
        assert.equal(takeMentionAnswerWait(-400), false);
    });

    it("does not fire the timeout once the question is claimed", async () => {
        let timedOut = false;
        startMentionAnswerWait(-500, 10, () => {
            timedOut = true;
        });

        assert.equal(takeMentionAnswerWait(-500), true);
        await delay(40);

        assert.equal(timedOut, false);
    });
});
