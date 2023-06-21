import { Bulk, createLazyClient, Redis, RedisValue } from "@/deps.ts";

const KEY_TYPES = {
    set: "set",
    hash: "hash",
} as const;

export type DB_DATA_TYPE = string[] | Record<string, string>;

/**
 * Custom Singleton wrapper of Redis client
 *
 * Provides helper functions to simplify work with bot DB
 */
class RedisClient {
    private static instance: RedisClient;
    private readonly redisClient: Redis;

    private redisUser = Deno.env.get("REDISUSER");
    private redisPassword = Deno.env.get("REDISPASS");
    private redisHost = Deno.env.get("REDISHOST") || "127.0.0.1";
    private redisPort = Deno.env.get("REDISPORT") || "6379";
    private configTableName = Deno.env.get("CONFIG_TABLE") ||
        "example_config";

    /**
     * Creates new lazy Redis client
     *
     * If bot's configuration doesn't have database credentials,
     * the connection will be configured to a database on localhost
     */
    private constructor() {
        this.redisClient = createLazyClient({
            username: this.redisUser,
            password: this.redisPassword,
            hostname: this.redisHost,
            port: parseInt(this.redisPort),
        });
    }

    /**
     * Returns instance of Redis сlient.
     * When the function is called for the first time,
     * the instance field is initialized
     *
     * @returns Instance of Redis сlient
     */
    public static getInstance() {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }

    /**
     * Call `quit()` method on active Redis client
     */
    public async quitClient() {
        await this.redisClient.quit();
    }

    /**
     * Checks if value belongs to a set
     *
     * @param key Name of set to check in
     * @param value Value to check in set
     * @returns True if value belongs to a set, False otherwise
     */
    public async isValueInSet(key: string, value: RedisValue) {
        return await this.redisClient.sismember(key, value) === 1;
    }

    /**
     * Checks if value doesn't belong to a set
     *
     * @param key Name of set to check in
     * @param value Value to check in set
     * @returns True if value doesn't belong to a set, False otherwise
     */
    public async isValueNotInSet(key: string, value: RedisValue) {
        return !(await this.isValueInSet(key, value));
    }

    /**
     * Returns the value of a field in a config hash.
     * If the value is missing,
     * a fallback is returned instead
     *
     * @param chatID ID of chat's config hash
     * @param field Name of field to get value from
     * @param fallback Fallback value to return instead of missing value.
     * If nothing passed, initialized with empty string
     * @returns Value from config hash or fallback value
     */
    public async getValueFromConfig(
        chatID: string | number,
        field: string,
        fallback: Bulk = "",
    ) {
        const hashValue = await this.redisClient.hget(
            `${this.configTableName}:${chatID}`,
            field,
        );
        return hashValue || fallback;
    }

    /**
     * Returns multiple values of a fields in a config hash.
     * If any value is missing, the value will be returned as null
     *
     * @param chatID ID of chat's config hash
     * @param fields Names of fields to get values from
     * @returns Array of values from config hash
     */
    public async getValuesFromConfig(
        chatID: number | string,
        ...fields: string[]
    ) {
        return await this.redisClient.hmget(
            `${this.configTableName}:${chatID}`,
            ...fields,
        );
    }

    /**
     * Returns all values of all fields in hash
     *
     * @param key Name of hash to get values
     * @returns Array of values of all fields in hash
     */
    public async getAllValuesFromHash(key: string) {
        return await this.redisClient.hgetall(key);
    }

    /**
     * Returns all values in a set
     *
     * @param key Name of set to get values
     * @returns Array of values in a set
     */
    public async getSetValues(key: string) {
        return await this.redisClient.smembers(key);
    }

    /**
     * Adds values to set
     *
     * @param key Name of set to add values to
     * @param values Values to add to set
     */
    public async addValuesToSet(key: string, ...values: RedisValue[]) {
        await this.redisClient.sadd(key, ...values);
    }

    /**
     * Updates values of config hash
     *
     * @param chatID ID of chat's config hash
     * @param values Object with values to set/update in config
     */
    public async setConfigData(
        chatID: string | number,
        values: Record<string, RedisValue>,
    ) {
        await this.redisClient.hset(
            `${this.configTableName}:${chatID}`,
            values,
        );
    }

    /**
     * Increments hash field by given value
     *
     * @param key Hash name to update
     * @param field Field name of hash to increment
     * @param increment Value to increment field by
     */
    public async incrementFieldByValue(
        key: string,
        field: string,
        increment: number,
    ) {
        await this.redisClient.hincrby(key, field, increment);
    }

    /**
     * Removes fields in config hash
     *
     * @param chatID ID of chat's config hash
     * @param fields Names of fields to remove
     */
    public async removeFieldsFromConfig(
        chatID: number | string,
        ...fields: string[]
    ) {
        await this.redisClient.hdel(
            `${this.configTableName}:${chatID}`,
            ...fields,
        );
    }

    /**
     * Removes values from set
     *
     * @param key Name of set to remove values from
     * @param values Values to remove from set
     */
    public async removeItemsFromSet(key: string, ...values: RedisValue[]) {
        await this.redisClient.srem(key, ...values);
    }

    /**
     * Imports dictionary values to database
     *
     * @param importData Dictionary object with DB data
     */
    public async importDatabase(importData: Record<string, DB_DATA_TYPE>) {
        for (const [key, value] of Object.entries(importData)) {
            if (Array.isArray(value)) {
                await this.importSet(key, value);
            }
            if (
                typeof value === "object" &&
                !Array.isArray(value) &&
                value !== null
            ) {
                await this.importHash(key, value);
            }
        }
    }

    /**
     * Exports database values as JSON string
     *
     * @returns JSON string with DB values
     */
    public async exportDatabase() {
        const exportMap = new Map<string, DB_DATA_TYPE>();
        const keys = await this.redisClient.keys("*");

        for (const key of keys) {
            const keyType = await this.redisClient.type(key);
            switch (keyType) {
                case KEY_TYPES.set:
                    exportMap.set(key, await this.exportSet(key));
                    break;
                case KEY_TYPES.hash:
                    exportMap.set(key, await this.exportHash(key));
                    break;
                default:
                    console.error(`Hit unsupported key type. Got: ${keyType}`);
                    break;
            }
        }

        return JSON.stringify(Object.fromEntries(exportMap), null, 4);
    }

    /**
     * Imports all values to set with given key.
     * If set exists, deletes before importing
     *
     * @param key Set key string
     * @param values Values for set importing
     */
    private async importSet(key: string, values: string[]) {
        if (await this.redisClient.exists(key) === 1) {
            await this.redisClient.del(key);
        }
        await this.addValuesToSet(key, ...values);
    }

    /**
     * Exports all set values for given set key
     *
     * @param key Set key string
     * @returns Set values for passed key
     */
    private async exportSet(key: string) {
        return await this.getSetValues(key);
    }

    /**
     * Imports all values to hash with given key.
     * If hash exists, deletes before importing
     *
     * @param key Hash key string
     * @param values Values for hash importing
     */
    private async importHash(key: string, hashData: Record<string, string>) {
        if (await this.redisClient.exists(key) === 1) {
            await this.redisClient.del(key);
        }
        await this.redisClient.hset(key, hashData);
    }

    /**
     * Exports all hash values for given hash key
     *
     * @param key Hash key string
     * @returns Dictionary with hash values for passed key
     */
    private async exportHash(key: string) {
        const hashData = await this.getAllValuesFromHash(key);
        const exportRecord: Record<string, string> = {};

        for (let i = 0; i < hashData.length; i += 2) {
            const keyName = hashData[i];
            const keyData = hashData[i + 1];
            exportRecord[keyName] = keyData;
        }

        return exportRecord;
    }
}

const redisClient = RedisClient.getInstance();

export default redisClient;
