import process from "node:process";

import type { Logger } from "./logger.ts";

type ShutdownHook = () => Promise<void> | void;

export function createLifecycle(logger: Logger) {
    const hooks: ShutdownHook[] = [];
    let isShuttingDown = false;

    async function shutdown(exitCode = 0) {
        if (isShuttingDown) {
            return;
        }
        isShuttingDown = true;

        let firstError: unknown;
        for (let i = hooks.length - 1; i >= 0; i--) {
            try {
                await hooks[i]();
            } catch (error) {
                logger.error(error);
                firstError ??= error;
            }
        }

        logger.flush();
        process.exit(firstError ? 1 : exitCode);
    }

    function handleSignal(signal: NodeJS.Signals) {
        if (isShuttingDown) {
            logger.warn({ msg: "Forcing exit on repeated signal", signal });
            logger.flush();
            process.exit(1);
        }
        shutdown(0);
    }

    process.on("SIGINT", () => handleSignal("SIGINT"));
    process.on("SIGTERM", () => handleSignal("SIGTERM"));
    process.on("uncaughtException", (error) => {
        logger.fatal({ msg: "uncaughtException", error });
        shutdown(1);
    });
    process.on("unhandledRejection", (reason) => {
        logger.fatal({ msg: "unhandledRejection", reason });
        shutdown(1);
    });

    return {
        onShutdown(hook: ShutdownHook) {
            hooks.push(hook);
        },
        shutdown,
    };
}
