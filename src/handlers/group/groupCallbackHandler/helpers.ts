import RedisSingleton from '@/utils/redisSingleton.ts';

export const deleteLocaleChangingStatus = async (
    client: RedisSingleton,
    chatID: string,
) => {
    return await client.deleteHashData(chatID, ['isMessageLocaleChanging']);
};
