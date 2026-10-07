import { createPendingStore } from "#root/bot/store/pending-store.js";

/**
 * Uploaded dumps awaiting an explicit `/import` confirmation, keyed by the
 * admin's user ID. Restoring replaces the whole database, so the file ID is
 * parked here until the admin presses the confirm button rather than being
 * acted on the moment a document arrives
 */
const pendingRestores = createPendingStore<string>();

export const startRestore = pendingRestores.start;
export const takeRestore = pendingRestores.take;
