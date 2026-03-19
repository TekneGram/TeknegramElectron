import { spawn, type ChildProcessWithoutNullStreams } from "child_process";
import fs from "node:fs";
import { getExecutablePath } from "../runtime/runtimePaths";
import { AppException } from "@electron/core/appException";

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

class NativeProcessRunner<T = unknown> {
    private nativeProcess!: ChildProcessWithoutNullStreams;
    private readonly params: NativeRunParams;
    private processOutput = "";
    private processErrorOutput = "";
    private stdoutBuffer = "";
    private jsonMessages: NativeJsonMessage<T>[] = [];
    private finalResult: T | undefined;
    private nativeJsonError: NativeErrorMessage | null = null;
    private wasCancelled: boolean = false;

    private constructor(
        params: NativeRunParams,
        nativeProcess: ChildProcessWithoutNullStreams
    ) {
        this.params = params;
        this.nativeProcess = nativeProcess;
    }

    static create<T = unknown>(params: NativeRunParams): NativeProcessRunner<T> {
        const executablePath = getExecutablePath(params.executable);

        if (!fs.existsSync(executablePath)) {
            throw new AppException(
                "CPP_PROCESS_SPAWN_FAILED",
                `Executable not found: ${executablePath}`
            );
        }

        const nativeProcess = spawn(executablePath, params.argv ?? [], {
            stdio: ["pipe", "pipe", "pipe"],
            windowsHide: true,
            env: process.env
        });

        return new NativeProcessRunner<T>(params, nativeProcess)
    }

    runProcess(jsonData?: string): Promise<NativeRunResult<T>> {
        return new Promise<NativeRunResult<T>>((resolve, reject) => {
            this.nativeProcess.on("error", (err: Error) => {
                reject(
                    new AppException(
                        "CPP_PROCESS_SPAWN_FAILED",
                        err.message || "Failed to start native process",
                        err.stack,
                        false
                    )
                );
            });

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

            this.nativeProcess.on("close", (code: number | null, signal: NodeJS.Signals | null) => {
                const exitCode = code ?? -1;

                if (this.params.expectJsonLines) {
                    this.consumeJsonLines(true);
                }

                // Stored JSON error first
                if (this.nativeJsonError) {
                    reject(
                        new AppException(
                            "CPP_PROCESS_NON_ZERO_EXIT",
                            this.nativeJsonError.message,
                            this.nativeJsonError.details,
                            false
                        )
                    );
                    return;
                }

                // Cancellation branch
                if (this.wasCancelled) {
                    reject(
                        new AppException(
                            "CPP_PROCESS_CANCELLED",
                            "Native process was cancelled",
                            this.processErrorOutput || this.processOutput,
                            false
                        )
                    );
                    return;
                }

                // Non-zero exit
                if (exitCode !== 0) {
                    const exitSummary = signal
                        ? `Process terminated by signal: ${signal}`
                        : `Exit code: ${exitCode}`;
                    reject(
                        new AppException(
                            "CPP_PROCESS_NON_ZERO_EXIT",
                            "Native process failed",
                            this.processErrorOutput || this.processOutput || exitSummary,
                            false
                        )
                    );
                    return;
                }

                // Missing result in JSON mode
                if (this.params.expectJsonLines && this.finalResult === undefined) {
                    reject(
                        new AppException(
                            "CPP_PROCESS_NON_ZERO_EXIT",
                            "Native process completed without a result message",
                            this.processOutput,
                            false
                        )
                    );
                    return;
                }

                // Success
                resolve({
                    stdout: this.processOutput,
                    stderr: this.processErrorOutput,
                    exitCode,
                    messages: this.jsonMessages,
                    result: this.finalResult,
                });
            });

            this.writeDataToProcess(jsonData ?? this.params.inputJson);
        })
    }

    cancelProcess(): void {
        if (!this.nativeProcess || this.nativeProcess.killed || this.nativeProcess.exitCode !== null) {
            return;
        }

        this.wasCancelled = true;
        this.nativeProcess.kill("SIGTERM");
    }

    private writeDataToProcess(jsonData?: string): void {
        if (jsonData !== undefined) {
            this.nativeProcess.stdin.write(jsonData + "\n", "utf8");
        }
        this.nativeProcess.stdin.end();
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

            if (parsed.type === "error") {
                this.nativeJsonError = parsed;
            }
        } catch (err) {
            // Preserve raw stdout for diagnostics; ignore non-JSON lines.
        }
    }
}

export default NativeProcessRunner;
