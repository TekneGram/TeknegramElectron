import { ipcMain, type IpcMainInvokeEvent } from "electron";
import { randomUUID } from "node:crypto";
import { logger } from "../services/logger";
import { toAppError, type Result, type AppError, type AppErrorCode } from "../core/appError";
import type { RequestContext } from "../core/requestContext";

type Handler<TArgs, TData> = (
    event: IpcMainInvokeEvent, 
    args: TArgs,
    ctx: RequestContext
) => Promise<TData> | TData;

export function toErrorResult(
    error: unknown,
    correlationId: string,
    fallback: AppErrorCode = "IPC_HANDLER_FAILED"
): { ok: false; error: AppError } {
    const appError = toAppError(error, fallback);
    appError.correlationId = correlationId;
    return { ok: false, error: appError };
}

export function safeHandle<TArgs, TData>(channel: string, handler: Handler<TArgs, TData>): void {
    ipcMain.handle(channel, async (event, args: TArgs): Promise<Result<TData>> => {
        const correlationId = randomUUID();
        const ctx: RequestContext = {
            correlationId,
            sendEvent(channel, payload) {
                event.sender.send(channel, payload);
            },
        };

        try {
            const data = await handler(event, args, ctx);
            return { ok: true, data };
        } catch (err) {
            const failureResult = toErrorResult(err, correlationId, "IPC_HANDLER_FAILED");

            logger.error(`IPC failed: ${channel}`, {
                correlationId,
                error: failureResult.error,
            });

            return failureResult;
        }
    });
}
