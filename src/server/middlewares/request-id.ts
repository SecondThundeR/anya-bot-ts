import { randomUUID } from "node:crypto";
import type { MiddlewareHandler } from "hono";

export function requestId(): MiddlewareHandler {
    return (c, next) => {
        c.set("requestId", randomUUID());

        return next();
    };
}
