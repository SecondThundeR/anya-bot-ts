import redisClient from "@/database/redisClient.ts";

import { stringToBoolean } from "@/utils/generalUtils.ts";

export async function getLocaleChangingStatus(
    chatID: number,
) {
    return stringToBoolean(
        await redisClient.getValueFromConfig(
            chatID,
            "isMessageLocaleChanging",
        ),
    );
}

export async function deleteLocaleChangingStatus(
    chatID: number,
) {
    return await redisClient.removeFieldsFromConfig(
        chatID,
        "isMessageLocaleChanging",
    );
}

export async function setLocaleChangingStatus(
    chatID: number,
) {
    return await redisClient.setConfigData(chatID, {
        isMessageLocaleChanging: "true",
    });
}
