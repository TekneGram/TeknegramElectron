/**
 * OS Locations behind app.getPath('userData')
 * macOS: ~/Library/Application Support/<AppName>
 * Windows: %APPDATA%\<AppName>
 * Linux: ~/.config/<AppName>
 * 
 */

import { app } from 'electron';
import path from "node:path";

type PlatformDir = "mac" | "windows" | "linux"

function getPlatformDir(): PlatformDir {
    if (process.platform === "darwin") return "mac";
    if (process.platform === "win32") return "windows";
    if (process.platform === "linux") return "linux";
    throw new Error(`Unsupported platform: ${process.platform}`);
}

function sanitizeResource(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
        throw new Error("Resource id cannot be empty.");
    }

    // Restrict to safe filesystem characters
    const safe = trimmed
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");
    if (!safe) {
         throw new Error("Resource id is invalid after sanitization.");
    }

    return safe;
}

export function getUserDataRoot(): string {
    return app.getPath("userData");
}

export function getRuntimeDbPath(): string {
    return app.isPackaged
        ? path.join(app.getPath("userData"), "db", "app.sqlite")
        : path.join(process.cwd(), "electron", "db", "dev-app.sqlite")
}

// Use this for logs
export function getGeneratedDataRoot(): string {
    return app.isPackaged
        ? path.join(app.getPath("userData"), "generated-data")
        : path.join(process.cwd(), "electron", "bin", "generated-data")
}

export function getGeneratedOutputDir(resourceId: string): string {
    return path.join(getGeneratedDataRoot(), sanitizeResource(resourceId));
}

// Use this for corpus binaries
export function getCorpusBinariesRoot(): string {
    return app.isPackaged
        ? path.join(app.getPath("userData"), "corpus-binaries")
        : path.join(process.cwd(), "electron", "bin", "corpus-binaries");
}

export function getCorpusBinariesDir(corpus_name: string): string {
    return path.join(getCorpusBinariesRoot(), sanitizeResource(corpus_name))
}

export function getCorpusDeletionStagingDir(projectUuid: string): string {
    return path.join(getGeneratedDataRoot(), "pending-delete", sanitizeResource(projectUuid));
}

// udpipe model
export function getUdpipeModelPath(): string {
    return app.isPackaged
        ? path.join(process.resourcesPath, "models", "english-partut-ud-2.5-191206.udpipe")
        : path.join(process.cwd(), "electron", "assets", "models", "english-partut-ud-2.5-191206.udpipe");
}

export function getSeedDbPath(): string {
    // Dev reads from project folder, packaged reads from bundled resources.
    return app.isPackaged
        ? path.join(process.resourcesPath, "seed", "app.sqlite")
        : path.join(process.cwd(), "electron", "assets", "seed", "app.sqlite");
}

export function getExecutablePath(executableName: string): string {
    const exe = process.platform === "win32" ? `${executableName}.exe` : executableName;
    const platform = getPlatformDir();

    const baseDir = app.isPackaged
        ? path.join(process.resourcesPath, "bin", "executables")
        : path.join(process.cwd(), "electron", "bin", "executables");

    return path.join(baseDir, platform, exe);
}

// Use for secrets
export function getConfigDir(): string {
    return path.join(getUserDataRoot(), "config");
}

export function getSecretsPath(): string {
    return path.join(getConfigDir(), "secrets.json");
}

// app.getPath('userData'); // use for all writable runtime data (SQLite files, generated binaries)
// process.resourcesPath // for packaged read-only assets (shipped executables, seed DB)
// app.isPackaged // to choose between dev asset and packaged asset source.
