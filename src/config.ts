import { API_CONSTANTS } from "grammy";
import * as v from "valibot";

// Side-effect import: loads `.env` before the environment is read below
import "#drizzle/env.js";

type CamelCase<S extends string> =
    S extends `${infer P1}_${infer P2}${infer P3}`
        ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
        : Lowercase<S>;

type KeysToCamelCase<T> = {
    [K in keyof T as CamelCase<string & K>]: T[K] extends object
        ? KeysToCamelCase<T[K]>
        : T[K];
};

const baseConfigSchema = v.object({
    useDebug: v.optional(
        v.pipe(v.string(), v.transform(JSON.parse), v.boolean()),
        "false",
    ),
    logLevel: v.optional(
        v.pipe(
            v.string(),
            v.picklist([
                "trace",
                "debug",
                "info",
                "warn",
                "error",
                "fatal",
                "silent",
            ]),
        ),
        "info",
    ),
    botToken: v.pipe(v.string(), v.regex(/^\d+:[\w-]+$/, "Invalid token")),
    botAllowedUpdates: v.optional(
        v.pipe(
            v.string(),
            v.transform(JSON.parse),
            v.array(v.picklist(API_CONSTANTS.ALL_UPDATE_TYPES)),
        ),
        "[]",
    ),
    adminIds: v.optional(
        v.pipe(v.string(), v.transform(JSON.parse), v.array(v.number())),
        "[]",
    ),
});

const configSchema = v.variant("botMode", [
    v.pipe(
        v.object({
            botMode: v.literal("polling"),
            ...baseConfigSchema.entries,
        }),
        v.transform((input) => ({
            ...input,
            isDebug: input.useDebug,
            isWebhookMode: false as const,
            isPollingMode: true as const,
        })),
    ),
    v.pipe(
        v.object({
            botMode: v.literal("webhook"),
            ...baseConfigSchema.entries,
            botWebhook: v.pipe(v.string(), v.url()),
            botWebhookSecret: v.pipe(v.string(), v.minLength(12)),
            serverHost: v.optional(v.string(), "0.0.0.0"),
            serverPort: v.optional(
                v.pipe(v.string(), v.transform(Number), v.number()),
                "80",
            ),
        }),
        v.transform((input) => ({
            ...input,
            isDebug: input.useDebug,
            isWebhookMode: true as const,
            isPollingMode: false as const,
        })),
    ),
]);

export type Config = v.InferOutput<typeof configSchema>;
export type PollingConfig = v.InferOutput<(typeof configSchema)["options"][0]>;
export type WebhookConfig = v.InferOutput<(typeof configSchema)["options"][1]>;

export function createConfig(input: v.InferInput<typeof configSchema>) {
    return v.parse(configSchema, input);
}

export const config = createConfigFromEnvironment();

function createConfigFromEnvironment() {
    function toCamelCase(str: string): string {
        return str
            .toLowerCase()
            .replace(/_([a-z])/g, (_match, p1) => p1.toUpperCase());
    }

    function convertKeysToCamelCase<T extends Record<string, unknown>>(
        obj: T,
    ): KeysToCamelCase<T> {
        const result = {} as KeysToCamelCase<T>;

        for (const key in obj) {
            if (Object.hasOwn(obj, key)) {
                const camelCaseKey = toCamelCase(
                    key,
                ) as keyof KeysToCamelCase<T>;
                const value = obj[key];

                result[camelCaseKey] = (
                    typeof value === "object" &&
                    value !== null &&
                    !Array.isArray(value)
                        ? convertKeysToCamelCase(
                              value as Record<string, unknown>,
                          )
                        : value
                ) as KeysToCamelCase<T>[typeof camelCaseKey];
            }
        }

        return result;
    }

    try {
        // @ts-expect-error create config from environment variables
        return createConfig(convertKeysToCamelCase(process.env));
    } catch (error) {
        throw new Error("Invalid config", {
            cause: error,
        });
    }
}
