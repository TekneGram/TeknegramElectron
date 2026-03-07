import { queryAll, executeRun } from "../sqlite";
import type { SqliteDatabase } from "../sqlite";

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

export type NewProjectRow = {
    uuid: string;
    project_name: string;
    created_at: string;
};

export type NewCorpusRow = {
    uuid: string;
    project_uuid: string;
    corpus_name: string;
    created_at: string;
};

export type NewCorpusFilesPathRow = {
    uuid: string;
    corpus_uuid: string;
    binary_files_path: string;
    created_at: string;
};

export function insertProject(db: SqliteDatabase, row: NewProjectRow): void {
    executeRun(
        db,
        `
            INSERT INTO projects (uuid, project_name, created_at)
            VALUES (?, ?, ?)
        `,
        [row.uuid, row.project_name, row.created_at]
    );
};

export function insertCorpus(db: SqliteDatabase, row: NewCorpusRow): void {
    executeRun(
        db,
        `
            INSERT INTO corpora (uuid, project_uuid, corpus_name, created_at)
            VALUES (?, ?, ?, ?)
        `,
        [row.uuid, row.project_uuid, row.corpus_name, row.created_at]
    );
}

export function insertCorpusFilePath(db: SqliteDatabase, row: NewCorpusFilesPathRow): void {
    executeRun(
        db,
        `
            INSERT INTO corpus_files_path (uuid, corpus_uuid, binary_files_path, created_at)
            VALUES (?, ?, ?, ?)
        `,
        [row.uuid, row.corpus_uuid, row.binary_files_path, row.created_at]
    );
}