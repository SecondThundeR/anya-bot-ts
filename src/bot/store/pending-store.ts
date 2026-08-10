type PendingEntry<T> = {
    value: T;
    timer: NodeJS.Timeout;
};

/**
 * Creates an in-process store for actions awaiting a user's confirmation.
 *
 * An entry lives until it is taken or its timer fires, whichever comes first.
 * Nothing is persisted on purpose: a restart cancels every pending
 * confirmation, so an entry can never get stuck, and an unconfirmed action can
 * never be applied later by surprise
 */
export function createPendingStore<T>() {
    const entries = new Map<number, PendingEntry<T>>();

    return {
        /**
         * Registers a pending entry and schedules its expiry
         *
         * @param key Identifier the confirmation will arrive with
         * @param value Payload to apply once confirmed
         * @param timeoutMs How long to wait for the confirmation
         * @param onTimeout Called once if the confirmation never arrives
         */
        start(key: number, value: T, timeoutMs: number, onTimeout: () => void) {
            const timer = setTimeout(() => {
                entries.delete(key);
                onTimeout();
            }, timeoutMs);
            // Never hold the process open just for a pending confirmation
            timer.unref?.();

            entries.set(key, { value, timer });
        },

        /**
         * Consumes a pending entry, cancelling its expiry timer
         *
         * @param key Identifier the confirmation arrived with
         * @returns Stored payload, or null when nothing is pending
         */
        take(key: number): T | null {
            const entry = entries.get(key);
            if (!entry) return null;

            clearTimeout(entry.timer);
            entries.delete(key);
            return entry.value;
        },

        has(key: number) {
            return entries.has(key);
        },
    };
}
