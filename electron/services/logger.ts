import fs from "node:fs";
import path from "node:path";
import { app } from "electron";

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

function getLogFilePath(): string {
    const dir = path.join(app.getPath("userData"), "logs");
    fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, "main.log");
}

function line(level: LogLevel, message: string, meta?: unknown): string {
    const ts = new Date().toISOString();
    const suffix = meta ? ` ${JSON.stringify(meta)}` : "";
    return `[${ts}] [${level}] ${message}${suffix}\n`;
}

export const logger = {
    info(message: string, meta?: unknown): void {
        fs.appendFileSync(getLogFilePath(), line("INFO", message, meta), "utf8");
    },
    warn(message: string, meta?: unknown): void {
        fs.appendFileSync(getLogFilePath(), line("WARN", message, meta), "utf8");
    },
    error(message: string, meta?:unknown): void {
        fs.appendFileSync(getLogFilePath(), line("ERROR", message, meta), "utf8");
    }
}