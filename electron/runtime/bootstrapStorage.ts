import fs from "node:fs";
import path from "node:path";
import { getGeneratedDataRoot, getRuntimeDbPath, getSeedDbPath } from "./runtimePaths";

export function bootstrapStorage(): void {
    const dbPath = getRuntimeDbPath();
    const dbDir = path.dirname(dbPath);

    fs.mkdirSync(dbDir, { recursive: true });
    fs.mkdirSync(getGeneratedDataRoot(), { recursive: true });

    // First run: copy seed DB into writable location.
    if (!fs.existsSync(dbPath)) {
        fs.copyFileSync(getSeedDbPath(), dbPath);
    }
}
