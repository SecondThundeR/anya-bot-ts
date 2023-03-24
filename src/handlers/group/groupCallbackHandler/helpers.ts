import RedisSingleton from "@utils/redisSingleton";

export async function deleteLocaleChangingStatus(
    client: RedisSingleton,
    chatID: string
) {
    return await client.deleteHashData(chatID, ["isMessageLocaleChanging"]);
}
