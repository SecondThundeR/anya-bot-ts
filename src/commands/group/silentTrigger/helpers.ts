import silentMessages from "@/locales/silentMessages.ts";

import { RedisClient } from "@/database/redisClient.ts";

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
    if (!silentStatus) {
        return await RedisClient.removeFieldsFromConfig(chatID, "isSilent");
    }
    await RedisClient.setConfigData(chatID, { isSilent: String(silentStatus) });
}

export async function updateSilentData(
    chatID: number,
) {
    const [isSilentString, silentOnLocale, silentOffLocale] = await RedisClient
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
