import { createPendingStore } from "#root/bot/store/pending-store.js";

/**
 * Chats waiting for the `/messagelocale` mention answer, keyed by chat ID.
 *
 * The new wording is already stored in the chat config by the time an entry
 * appears here, so there is no payload to keep — the entry only marks that the
 * keyboard is still live. An unanswered question leaves the mention mode as it
 * was instead of resetting it
 */
const pendingAnswers = createPendingStore<true>();

export function startMentionAnswerWait(
    chatID: number,
    timeoutMs: number,
    onTimeout: () => void,
) {
    pendingAnswers.start(chatID, true, timeoutMs, onTimeout);
}

/**
 * Claims the pending question so only the first answer is applied
 *
 * @returns True when the question was still open, False when it already expired
 */
export function takeMentionAnswerWait(chatID: number) {
    return pendingAnswers.take(chatID) !== null;
}

export const isMentionAnswerPending = pendingAnswers.has;
