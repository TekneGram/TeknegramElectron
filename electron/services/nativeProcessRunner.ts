import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import fs from "node:fs";
import { getExecutablePath, getGeneratedOutputDir } from "../runtime/runtimePaths";
import { type AppError } from "../core/appError";

type BuildResourceParams = {
    mode: "build";
    executable: string;
    resourceId: string;
    inputPath: string;
    configPath?: string;
    inputJson?: string;
};

type AnalyzeResourceParams = {
    mode: "analyze",
    executable: string;
    resourceId: string;
    inputJson?: string;
};

export type NativeRunParams = BuildResourceParams | AnalyzeResourceParams;

export type NativeRunResult = {
    stdout: string;
    stderr: string;
    exitCode: number;
}

export type NativeRunCallback = (error: AppError | null, result: NativeRunResult | null) => void;

class NativeProcessRunner {
    private nativeProcess!: ChildProcessWithoutNullStreams;
    private processOutput = "";
    private processErrorOutput = "";
    private generatedOutputDir = "";
    private executablePath = "";

    constructor(params: NativeRunParams, callback: NativeRunCallback) {
        try {
            this.executablePath = getExecutablePath(params.executable);
            this.generatedOutputDir = getGeneratedOutputDir(params.resourceId);

            fs.mkdirSync(this.generatedOutputDir, { recursive: true });

            if (!fs.existsSync(this.executablePath)) {
                throw new Error(`Executable not found: ${this.executablePath}`);
            }

            let args: string[] = [];
            if (params.mode === "build") {
                if (!fs.existsSync(params.inputPath)) {
                    throw new Error(`Input path not found: ${params.inputPath}`);
                }
                args = [params.inputPath, params.resourceId, this.generatedOutputDir];
                if (params.configPath) args.push(params.configPath);
            } else {
                args = [
                    "--output-dir",
                    this.generatedOutputDir,
                    "--resource-id",
                    params.resourceId
                ];
            }

            this.nativeProcess = spawn(this.executablePath, args, {
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

    runProcess(jsonData: string, callback: NativeRunCallback): void {
        this.writeDataToProcess(jsonData);
        this.collectOutput(callback);
    }

    getProcessOutput(): string {
        return this.processOutput;
    }

    getProcessErrors(): string {
        return this.processErrorOutput;
    }

    private writeDataToProcess(jsonData: string): void {
        this.nativeProcess.stdin.write(jsonData + "\n", "utf8");
        this.nativeProcess.stdin.end();
    }

    private collectOutput(callback: NativeRunCallback): void {
        this.nativeProcess.stdout.on("data", (data: Buffer) => {
            this.processOutput += data.toString("utf8");
        });

        this.nativeProcess.stderr.on("data", (data: Buffer) => {
            this.processErrorOutput += data.toString("utf8");
        });

        this.nativeProcess.on("close", (code: number | null) => {
            const exitCode = code ?? -1;

            if (exitCode === 0) {
                callback(null, {
                    stdout: this.processOutput,
                    stderr: this.processErrorOutput,
                    exitCode,
                });
            } else {
                callback({
                    code: "CPP_PROCESS_NON_ZERO_EXIT",
                    message: "Native process failed",
                    details: this.processErrorOutput || `Exit code: ${exitCode}`,
                    retryable: false,
                }, null);
            }
        });
    }
}

export default NativeProcessRunner;
