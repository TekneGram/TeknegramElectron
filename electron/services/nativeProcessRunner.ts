import { spawn, type ChildProcessWithoutNullStreams } from "child_process";
import fs from "node:fs";
import { getExecutablePath } from "../runtime/runtimePaths";
import type { AppError } from "../core/appError";

export type NativeProgressMessage = {
    type: "progress";
    message: string;
    percent?: number;
};

export type NativeResultMessage<T = unknown> = {
    type: "result";
    data: T;
};

export type NativeErrorMessage = {
    type: "error";
    message: string;
    code?: string;
    details?: string;
};

export type NativeJsonMessage<T = unknown> =
    | NativeProgressMessage
    | NativeResultMessage<T>
    | NativeErrorMessage;

export type NativeRunParams = {
    executable: string;
    argv?: string[];
    inputJson?: string;
    expectJsonLines?: boolean;
    onProgress?: (message: NativeProgressMessage) => void;
};

export type NativeRunResult<T = unknown> = {
    stdout: string;
    stderr: string;
    exitCode: number;
    messages: NativeJsonMessage<T>[];
    result?: T;
};

export type NativeRunCallback<T = unknown> = (
    error: AppError | null,
    result: NativeRunResult<T> | null
) => void;

class NativeProcessRunner<T = unknown> {
    private nativeProcess!: ChildProcessWithoutNullStreams;
    private readonly params: NativeRunParams;
    private processOutput = "";
    private processErrorOutput = "";
    private stdoutBuffer = "";
    private jsonMessages: NativeJsonMessage<T>[] = [];
    private finalResult: T | undefined;

    constructor(params: NativeRunParams, callback: NativeRunCallback<T>) {
        this.params = params;

        try {
            const executablePath = getExecutablePath(params.executable);
            if (!fs.existsSync(executablePath)) {
                throw new Error(`Executable not found: ${executablePath}`);
            }

            this.nativeProcess = spawn(executablePath, params.argv ?? [], {
                stdio: ["pipe", "pipe", "pipe"],
                windowsHide: true,
                env: process.env,
            });

            this.nativeProcess.on("error", (err: Error) => {
                callback({
                    code: "CPP_PROCESS_SPAWN_FAILED",
                    message: err.message || "Failed to start native process",
                    details: err.stack,
                    retryable: false,
                }, null);
            });
        } catch (err) {
            callback({
                code: "CPP_PROCESS_SPAWN_FAILED",
                message: (err as Error).message || "Failed to start native process",
                details: err instanceof Error ? err.stack : undefined,
                retryable: false,
            }, null);
        }
    }

    runProcess(jsonData: string | undefined, callback: NativeRunCallback<T>): void {
        this.writeDataToProcess(jsonData ?? this.params.inputJson);
        this.collectOutput(callback);
    }

    getProcessOutput(): string {
        return this.processOutput;
    }

    getProcessErrors(): string {
        return this.processErrorOutput;
    }

    private writeDataToProcess(jsonData?: string): void {
        if (jsonData !== undefined) {
            this.nativeProcess.stdin.write(jsonData + "\n", "utf8");
        }
        this.nativeProcess.stdin.end();
    }

    private collectOutput(callback: NativeRunCallback<T>): void {
        this.nativeProcess.stdout.on("data", (data: Buffer) => {
            const chunk = data.toString("utf8");
            this.processOutput += chunk;

            if (!this.params.expectJsonLines) {
                return;
            }

            this.stdoutBuffer += chunk;
            this.consumeJsonLines();
        });

        this.nativeProcess.stderr.on("data", (data: Buffer) => {
            this.processErrorOutput += data.toString("utf8");
        });

        this.nativeProcess.on("close", (code: number | null) => {
            const exitCode = code ?? -1;

            if (this.params.expectJsonLines) {
                this.consumeJsonLines(true);
            }

            if (exitCode !== 0) {
                callback({
                    code: "CPP_PROCESS_NON_ZERO_EXIT",
                    message: "Native process failed",
                    details: this.processErrorOutput || `Exit code: ${exitCode}`,
                    retryable: false,
                }, null);
                return;
            }

            if (this.params.expectJsonLines && this.finalResult === undefined) {
                callback({
                    code: "CPP_PROCESS_NON_ZERO_EXIT",
                    message: "Native process completed without a result message",
                    details: this.processOutput,
                    retryable: false,
                }, null);
                return;
            }

            callback(null, {
                stdout: this.processOutput,
                stderr: this.processErrorOutput,
                exitCode,
                messages: this.jsonMessages,
                result: this.finalResult,
            });
        });
    }

    private consumeJsonLines(flushRemainder = false): void {
        let newlineIndex = this.stdoutBuffer.indexOf("\n");
        while (newlineIndex !== -1) {
            const line = this.stdoutBuffer.slice(0, newlineIndex).trim();
            this.stdoutBuffer = this.stdoutBuffer.slice(newlineIndex + 1);
            this.consumeJsonLine(line);
            newlineIndex = this.stdoutBuffer.indexOf("\n");
        }

        if (flushRemainder) {
            const line = this.stdoutBuffer.trim();
            this.stdoutBuffer = "";
            this.consumeJsonLine(line);
        }
    }

    private consumeJsonLine(line: string): void {
        if (!line) {
            return;
        }

        try {
            const parsed = JSON.parse(line) as NativeJsonMessage<T>;
            this.jsonMessages.push(parsed);

            if (parsed.type === "progress") {
                this.params.onProgress?.(parsed);
                return;
            }

            if (parsed.type === "result") {
                this.finalResult = parsed.data;
            }
        } catch {
            // Preserve raw stdout for diagnostics; ignore non-JSON lines.
        }
    }
}

export default NativeProcessRunner;
