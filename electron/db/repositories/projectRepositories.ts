import { SqliteDatabase, queryAll } from "../sqlite";

type ProjectRow = {
    uuid: string;
    project_name: string;
    created_at: string;
};

export function listProjectRows(db: SqliteDatabase): ProjectRow[] {
    return queryAll<ProjectRow>(
        db,
        `
            SELECT uuid, project_name, created_at
            FROM projects
            ORDER BY created_at DESC
        `
    );
}