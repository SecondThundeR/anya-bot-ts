import RedisSingleton from "@/utils/redisSingleton.ts";

export async function deleteLocaleChangingStatus(
    client: RedisSingleton,
    chatID: string,
) {
    return await client.deleteHashData(chatID, ["isMessageLocaleChanging"]);
}
