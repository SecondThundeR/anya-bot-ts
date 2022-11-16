import { createLazyClient, Redis } from '@/deps.ts';

interface ListsObject {
    [key: string]: string[];
}

class RedisSingleton {
    private static instance: RedisSingleton;
    private readonly redisClient: Redis;
    private redisUser?: string = Deno.env.get('REDIS_USER');
    private redisPass?: string = Deno.env.get('REDIS_PASS');
    private redisHost: string = Deno.env.get('REDIS_URL') || '127.0.0.1';
    private redisPort: string = Deno.env.get('REDIS_PORT') || '6379';
    private chatsConfigTableName?: string = Deno.env.get('CHATS_TABLE_NAME');

    private constructor() {
        this.redisClient = createLazyClient({
            hostname: this.redisHost,
            port: parseInt(this.redisPort),
            password: this.redisPass,
            username: this.redisUser,
        });
    }

    public static getInstance(): RedisSingleton {
        if (!RedisSingleton.instance) {
            RedisSingleton.instance = new RedisSingleton();
        }
        return RedisSingleton.instance;
    }

    public async quitClient() {
        await this.redisClient.quit();
    }

    public async getHashData(
        chatID: number | string,
        hashName: string,
        defaultData = '',
    ): Promise<string> {
        return (
            (await this.redisClient.hget(
                `${this.chatsConfigTableName}:${chatID}`,
                hashName,
            )) || defaultData
        );
    }

    public async getAllHashData(
        hashName: string,
    ): Promise<string[]> {
        return await this.redisClient.hgetall(hashName);
    }

    public async getHashMultipleData(
        chatID: number | string,
        hashNames: string[],
    ): Promise<(string | null)[]> {
        return await this.redisClient.hmget(
            `${this.chatsConfigTableName}:${chatID}`,
            ...hashNames,
        );
    }

    public async getList(listName: string): Promise<string[]> {
        return await this.redisClient.lrange(listName, 0, -1);
    }

    public async getLists(listNames: string[]): Promise<ListsObject> {
        const listsData: ListsObject = {};
        for (const listName of listNames) {
            listsData[listName] = await this.getList(listName);
        }
        return listsData;
    }

    public async setHashData(
        chatID: number | string,
        hashData: { [key: string]: string },
    ): Promise<void> {
        for (const [key, value] of Object.entries(hashData)) {
            await this.redisClient.hset(
                `${this.chatsConfigTableName}:${chatID}`,
                key,
                value,
            );
        }
    }

    public async incrementFieldBy(
        hashName: string,
        field: string,
        value: number,
    ): Promise<void> {
        await this.redisClient.hincrby(hashName, field, value);
    }

    public async pushValueToList(
        listName: string,
        value: string,
    ): Promise<void> {
        await this.redisClient.rpush(listName, value);
    }

    public async deleteHashData(
        chatID: number | string,
        hashNames: string[],
    ): Promise<void> {
        await this.redisClient.hdel(
            `${this.chatsConfigTableName}:${chatID}`,
            ...hashNames,
        );
    }

    public async removeValueFromList(
        listName: string,
        value: string,
    ): Promise<void> {
        await this.redisClient.lrem(listName, 1, value);
    }
}

export default RedisSingleton;
