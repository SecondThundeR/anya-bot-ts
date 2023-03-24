import RedisSingleton from "@utils/redisSingleton";
import RegularUtils from "@utils/regularUtils";

export async function getLocaleChangingStatus(
    client: RedisSingleton,
    chatID: number
) {
    return RegularUtils.getBoolean(
        await client.getHashData(chatID, "isMessageLocaleChanging")
    );
}

export async function deleteLocaleChangingStatus(
    client: RedisSingleton,
    chatID: number
) {
    return await client.deleteHashData(chatID, ["isMessageLocaleChanging"]);
}

export async function setLocaleChangingStatus(
    client: RedisSingleton,
    chatID: number
) {
    return await client.setHashData(chatID, {
        isMessageLocaleChanging: "true"
    });
}
