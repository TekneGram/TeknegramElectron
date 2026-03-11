import fs from "node:fs";
import path from "node:path";
import { app } from "electron";
import type { SqliteDatabase } from "./sqlite";

function getMigrationsDir(): string {
    // Dev: read from the source folder
    if (!app.isPackaged) {
        return path.join(process.cwd(), "electron", "db", "migration");
    }

    // Packaged: copy this folder with electron-builder extraResources
    return path.join(process.resourcesPath, "db-migration");
}

export function runMigrationsFromFiles(db: SqliteDatabase): void {
    db.exec(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            name TEXT PRIMARY KEY,
            executed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `);

    const dir = getMigrationsDir();
    if (!fs.existsSync(dir)) return;

    const files = fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".sql"))
        .sort((a, b) => a.localeCompare(b));

    const isAppliedStmt = db.prepare(
        "SELECT 1 FROM schema_migrations WHERE name = ? LIMIT 1"
    );
    const markAppliedStmt = db.prepare(
        "INSERT INTO schema_migrations (name) VALUES (?)"
    );

    for (const file of files) {
        const alreadyApplied = isAppliedStmt.get(file);
        if (alreadyApplied) continue;

        const sql = fs.readFileSync(path.join(dir, file), "utf8");

        const apply = db.transaction(() => {
            db.exec(sql);
            markAppliedStmt.run(file)
        });

        apply();
    }
}