import RedisSingleton from "@/database/redisSingleton.ts";

export async function deleteLocaleChangingStatus(
    client: RedisSingleton,
    chatID: string,
) {
    return await client.deleteHashData(chatID, ["isMessageLocaleChanging"]);
}
