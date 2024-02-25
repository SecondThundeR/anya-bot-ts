import { RedisClient } from "@/database/redisClient.ts";

import { stringToBoolean } from "@/utils/generalUtils.ts";

export async function getLocaleChangingStatus(
    chatID: number,
) {
    return stringToBoolean(
        await RedisClient.getValueFromConfig(
            chatID,
            "isMessageLocaleChanging",
        ),
    );
}

export async function deleteLocaleChangingStatus(
    chatID: number,
) {
    return await RedisClient.removeFieldsFromConfig(
        chatID,
        "isMessageLocaleChanging",
    );
}

export async function setLocaleChangingStatus(
    chatID: number,
) {
    return await RedisClient.setConfigData(chatID, {
        isMessageLocaleChanging: "true",
    });
}
