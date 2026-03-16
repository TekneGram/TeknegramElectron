import { safeStorage } from 'electron';
import fs from "node:fs/promises";
import path from "node:path";
import type { SecretStoragePort } from "../ports/secretStorage.port";
import { getSecretsPath } from "@electron/runtime/runtimePaths";

type StoredSecretsFile = Record<string, string>;

async function readSecretsFile(filepath: string): Promise<StoredSecretsFile> {
    try {
        const raw = await fs.readFile(filepath, "utf8");
        return JSON.parse(raw) as StoredSecretsFile;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            return {};
        }
        throw error;
    }
}

export const secretStorageAdapter: SecretStoragePort = {
    async getSecret(key: string): Promise<string | null> {
        const filePath = getSecretsPath();
        const store = await readSecretsFile(filePath);
        const encryptedBase64 = store[key];

        if (!encryptedBase64) {
            return null;
        }

        const encryptedBuffer = Buffer.from(encryptedBase64, "base64");
        return safeStorage.decryptString(encryptedBuffer);
    },

    async setSecret(key: string, value: string): Promise<void> {
        const filePath = getSecretsPath();
        const store = await readSecretsFile(filePath);

        const encryptedBuffer = safeStorage.encryptString(value);
        store[key] = encryptedBuffer.toString("base64");

        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(store, null, 2), "utf8");
    },

    async deleteSecret(key: string): Promise<void> {
        const filePath = getSecretsPath();
        const store = await readSecretsFile(filePath);

        delete store[key];

        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(store, null, 2), "utf8");
    },
};
