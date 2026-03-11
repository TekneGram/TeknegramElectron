import { logger } from "@electron/services/logger";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { openDatabase, closeDatabase } from "./sqlite";
import { runMigrationsFromFiles } from "./runMigrations";

export function initializeDatabase(): void {
    const dbPath = getRuntimeDbPath();

    logger.info("Initializing database", { dbPath });

    const db = openDatabase(dbPath);

    try {
        runMigrationsFromFiles(db);

        logger.info("Database initialized", { dbPath });
    } catch (error) {
        logger.error("Database initialization failed", {
            dbPath,
            error: error instanceof Error ? error.message : String(error),
        });
        throw error;
    } finally {
        closeDatabase(db);
    }
}