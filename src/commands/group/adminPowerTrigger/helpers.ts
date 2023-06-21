import RedisSingleton from "@/database/redisSingleton.ts";
import RegularUtils from "@/utils/regularUtils.ts";

function getDefaultAllowWord(currentStatus: boolean) {
    return currentStatus
        ? "Сила админов в деле! Теперь я не буду удалять запрещенный контент, отправленный ими"
        : "Чувствуете? Сила админов кажется исчезла :( Теперь я буду удалять запрещенный контент, отправленный ими";
}

function parseSilentValueFromDB(currentStatus: string | null) {
    return currentStatus === null
        ? false
        : RegularUtils.getBoolean(currentStatus);
}

async function changeAllowValueInDB(
    client: RedisSingleton,
    chatID: number,
    silentStatus: boolean,
) {
    if (!silentStatus) {
        return await client.deleteHashData(chatID, ["adminPower"]);
    }
    await client.setHashData(chatID, { adminPower: String(silentStatus) });
}

export async function updateAllowData(
    client: RedisSingleton,
    chatID: number,
) {
    const allowStickersString = await client.getHashData(chatID, "adminPower");
    const allowStickersStringReversed = !parseSilentValueFromDB(
        allowStickersString,
    );
    await changeAllowValueInDB(client, chatID, allowStickersStringReversed);

    return getDefaultAllowWord(allowStickersStringReversed);
}
