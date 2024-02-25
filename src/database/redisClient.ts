import { createLazyClient } from "@/deps.ts";
import type { Bulk, Redis, RedisValue } from "@/deps.ts";

import { DEFAULT_OPTIONS } from "@/constants/database/defaultOptions.ts";
import { KEY_TYPES } from "@/constants/database/keyTypes.ts";

import { RedisClientException } from "@/database/redisClientException.ts";

import type {
    RedisClientData,
    RedisClientInitOptions,
} from "@/types/database.ts";

/**
 * Custom wrapper of Redis client
 *
 * Provides helper functions to simplify work with bot DB
 */
export class RedisClient {
    private static client: Redis;
    private static configTableName: string;

    /**
     * Creates new singleton instance of lazy Redis client
     *
     * If bot's configuration doesn't have database credentials,
     * the connection will be configured to a database on localhost
     */
    public static init(options: RedisClientInitOptions) {
        if (RedisClient.client) {
            console.warn("Can't re-init client as it already initialized");
            return;
        }

        RedisClient.client = createLazyClient({
            username: options.username,
            password: options.password,
            hostname: options.hostname ?? DEFAULT_OPTIONS.hostname,
            port: parseInt(options.port ?? DEFAULT_OPTIONS.port),
        });
        RedisClient.configTableName = options.tableName ??
            DEFAULT_OPTIONS.configTableName;
    }

    /**
     * Checks if client is initializated before usage
     */
    private static checkInitialization() {
        if (!RedisClient.client) {
            throw new RedisClientException(
                "Attempt to use RedisClient without initialization!",
            );
        }
    }

    /**
     * Call `quit()` method on active Redis client
     */
    public static async quitClient() {
        RedisClient.checkInitialization();
        await RedisClient.client.quit();
    }

    /**
     * Checks if value belongs to a set
     *
     * @param key Name of set to check in
     * @param value Value to check in set
     * @returns True if value belongs to a set, False otherwise
     */
    public static async isValueInSet(key: string, value: RedisValue) {
        RedisClient.checkInitialization();
        return await RedisClient.client.sismember(key, value) === 1;
    }

    /**
     * Checks if value doesn't belong to a set
     *
     * @param key Name of set to check in
     * @param value Value to check in set
     * @returns True if value doesn't belong to a set, False otherwise
     */
    public static async isValueNotInSet(key: string, value: RedisValue) {
        RedisClient.checkInitialization();
        return !(await RedisClient.isValueInSet(key, value));
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
    public static async getValueFromConfig(
        chatID: string | number,
        field: string,
        fallback: Bulk = "",
    ) {
        RedisClient.checkInitialization();
        const hashValue = await RedisClient.client.hget(
            `${RedisClient.configTableName}:${chatID}`,
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
    public static async getValuesFromConfig(
        chatID: number | string,
        ...fields: string[]
    ) {
        RedisClient.checkInitialization();
        return await RedisClient.client.hmget(
            `${RedisClient.configTableName}:${chatID}`,
            ...fields,
        );
    }

    /**
     * Returns all values of all fields in hash
     *
     * @param key Name of hash to get values
     * @returns Array of values of all fields in hash
     */
    public static async getAllValuesFromHash(key: string) {
        RedisClient.checkInitialization();
        return await RedisClient.client.hgetall(key);
    }

    /**
     * Returns all values in a set
     *
     * @param key Name of set to get values
     * @returns Array of values in a set
     */
    public static async getSetValues(key: string) {
        RedisClient.checkInitialization();
        return await RedisClient.client.smembers(key);
    }

    /**
     * Adds values to set
     *
     * @param key Name of set to add values to
     * @param values Values to add to set
     */
    public static async addValuesToSet(key: string, ...values: RedisValue[]) {
        RedisClient.checkInitialization();
        await RedisClient.client.sadd(key, ...values);
    }

    /**
     * Updates values of config hash
     *
     * @param chatID ID of chat's config hash
     * @param values Object with values to set/update in config
     */
    public static async setConfigData(
        chatID: string | number,
        values: Record<string, RedisValue>,
    ) {
        RedisClient.checkInitialization();
        await RedisClient.client.hset(
            `${RedisClient.configTableName}:${chatID}`,
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
    public static async incrementFieldByValue(
        key: string,
        field: string,
        increment: number,
    ) {
        RedisClient.checkInitialization();
        await RedisClient.client.hincrby(key, field, increment);
    }

    /**
     * Removes fields in config hash
     *
     * @param chatID ID of chat's config hash
     * @param fields Names of fields to remove
     */
    public static async removeFieldsFromConfig(
        chatID: number | string,
        ...fields: string[]
    ) {
        RedisClient.checkInitialization();
        await RedisClient.client.hdel(
            `${RedisClient.configTableName}:${chatID}`,
            ...fields,
        );
    }

    /**
     * Removes values from set
     *
     * @param key Name of set to remove values from
     * @param values Values to remove from set
     */
    public static async removeItemsFromSet(
        key: string,
        ...values: RedisValue[]
    ) {
        RedisClient.checkInitialization();
        await RedisClient.client.srem(key, ...values);
    }

    /**
     * Imports dictionary values to database
     *
     * @param importData Dictionary object with DB data
     */
    public static async importDatabase(
        importData: Record<string, RedisClientData>,
    ) {
        RedisClient.checkInitialization();
        for (const [key, value] of Object.entries(importData)) {
            if (Array.isArray(value)) {
                await RedisClient.importSet(key, value);
            }
            if (
                typeof value === "object" &&
                !Array.isArray(value) &&
                value !== null
            ) {
                await RedisClient.importHash(key, value);
            }
        }
    }

    /**
     * Exports database values as JSON string
     *
     * @returns JSON string with DB values
     */
    public static async exportDatabase() {
        RedisClient.checkInitialization();
        const exportMap = new Map<string, RedisClientData>();
        const keys = await RedisClient.client.keys("*");

        for (const key of keys) {
            const keyType = await RedisClient.client.type(key);
            switch (keyType) {
                case KEY_TYPES.set:
                    exportMap.set(key, await RedisClient.exportSet(key));
                    break;
                case KEY_TYPES.hash:
                    exportMap.set(key, await RedisClient.exportHash(key));
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
    private static async importSet(key: string, values: string[]) {
        if (await RedisClient.client.exists(key) === 1) {
            await RedisClient.client.del(key);
        }
        await RedisClient.addValuesToSet(key, ...values);
    }

    /**
     * Exports all set values for given set key
     *
     * @param key Set key string
     * @returns Set values for passed key
     */
    private static async exportSet(key: string) {
        return await RedisClient.getSetValues(key);
    }

    /**
     * Imports all values to hash with given key.
     * If hash exists, deletes before importing
     *
     * @param key Hash key string
     * @param values Values for hash importing
     */
    private static async importHash(
        key: string,
        hashData: Record<string, string>,
    ) {
        if (await RedisClient.client.exists(key) === 1) {
            await RedisClient.client.del(key);
        }
        await RedisClient.client.hset(key, hashData);
    }

    /**
     * Exports all hash values for given hash key
     *
     * @param key Hash key string
     * @returns Dictionary with hash values for passed key
     */
    private static async exportHash(key: string) {
        const hashData = await RedisClient.getAllValuesFromHash(key);
        const exportRecord: Record<string, string> = {};

        for (let i = 0; i < hashData.length; i += 2) {
            const keyName = hashData[i];
            const keyData = hashData[i + 1];
            exportRecord[keyName] = keyData;
        }

        return exportRecord;
    }
}
