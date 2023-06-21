import silentMessages from "@/locales/silentMessages.ts";

import redisClient from "@/database/redisClient.ts";

import { stringToBoolean, verifyLocaleWord } from "@/utils/generalUtils.ts";

function getDefaultSilentWord(currentStatus: boolean) {
    return currentStatus
        ? silentMessages.enabledDefault
        : silentMessages.disabledDefault;
}

function parseSilentValueFromDB(currentStatus: string | null) {
    return currentStatus === null ? false : stringToBoolean(currentStatus);
}

async function changeSilentStatusInDB(
    chatID: number,
    silentStatus: boolean,
) {
    const client = redisClient;
    if (!silentStatus) {
        return await client.removeFieldsFromConfig(chatID, "isSilent");
    }
    await client.setConfigData(chatID, { isSilent: String(silentStatus) });
}

export async function updateSilentData(
    chatID: number,
) {
    const client = redisClient;
    const [isSilentString, silentOnLocale, silentOffLocale] = await client
        .getValuesFromConfig(
            chatID,
            "isSilent",
            "silentOnLocale",
            "silentOffLocale",
        );
    const isSilentReversed = !parseSilentValueFromDB(isSilentString);
    await changeSilentStatusInDB(chatID, isSilentReversed);

    return verifyLocaleWord(
        isSilentReversed ? silentOnLocale : silentOffLocale,
        getDefaultSilentWord(isSilentReversed),
    );
}
