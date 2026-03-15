import { queryAll, executeRun, queryOne } from "../sqlite";
import type { SqliteDatabase } from "../sqlite";

type ProjectRow = {
    uuid: string;
    project_name: string;
    created_at: string;
};

export type ProjectDeleteTargetRow = {
    project_uuid: string;
    corpus_uuid: string;
    binary_files_path: string;
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

export function findProjectRowByUuid(db: SqliteDatabase, projectUuid: string): ProjectRow | undefined {
    return queryOne<ProjectRow>(
        db,
        `
            SELECT uuid, project_name, created_at
            FROM projects
            WHERE uuid = ?
            LIMIT 1
        `,
        [projectUuid]
    );
}

export function findProjectDeleteTargetRow(db: SqliteDatabase, projectUuid: string): ProjectDeleteTargetRow | undefined {
    return queryOne<ProjectDeleteTargetRow>(
        db,
        `
            SELECT
                p.uuid AS project_uuid,
                c.uuid AS corpus_uuid,
                cfp.binary_files_path AS binary_files_path
            FROM projects p
            INNER JOIN corpora c ON c.project_uuid = p.uuid
            INNER JOIN corpus_files_path cfp ON cfp.corpus_uuid = c.uuid
            WHERE p.uuid = ?
            LIMIT 1
        `,
        [projectUuid]
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
}

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

export function deleteProjectRow(db: SqliteDatabase, projectUuid: string): void {
    executeRun(
        db,
        `
            DELETE FROM projects
            WHERE uuid = ?
        `,
        [projectUuid]
    );
}

export function updateProjectNameRow(db: SqliteDatabase, projectUuid: string, projectName: string): void {
    executeRun(
        db,
        `
            UPDATE projects
            SET project_name = ?
            WHERE uuid = ?
        `,
        [projectName, projectUuid]
    );
}
