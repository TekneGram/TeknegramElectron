import { executeRun, queryAll, queryOne, type SqliteDatabase } from "../sqlite";

export type ActivityProjectContextRow = {
    project_id: string;
    corpus_id: string;
    corpus_name: string;
    binary_files_path: string;
};

export type ActivityTypeRow = {
    activity_type: string;
    display_name: string;
    description: string | null;
};

export type ActivityCountRow = {
    activity_count: number;
};

export type ActivityDetailsRow = {
    activity_id: string;
    activity_name: string;
    activity_type: string;
    activity_type_display_name: string;
    description: string;
};

export type NewActivityRow = {
    uuid: string;
    corpus_uuid: string;
    activity_name: string;
    activity_type: string;
    created_at: string;
    updated_at: string;
};

export type NewActivitySummaryRow = {
    uuid: string;
    activity_uuid: string;
    description: string;
    created_at: string;
    updated_at: string;
};

export function findActivityProjectContextRowByProjectUuid(
    db: SqliteDatabase,
    projectUuid: string,
): ActivityProjectContextRow | undefined {
    return queryOne<ActivityProjectContextRow>(
        db,
        `
            SELECT
                p.uuid AS project_id,
                c.uuid AS corpus_id,
                c.corpus_name AS corpus_name,
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

export function findActivityTypeRowByActivityType(
    db: SqliteDatabase,
    activityType: string,
): ActivityTypeRow | undefined {
    return queryOne<ActivityTypeRow>(
        db,
        `
            SELECT
                activity_type,
                display_name,
                description
            FROM activity_types
            WHERE activity_type = ?
            LIMIT 1
        `,
        [activityType]
    );
}

export function countActivityRowsByProjectUuidAndType(
    db: SqliteDatabase,
    projectUuid: string,
    activityType: string,
): number {
    const row = queryOne<ActivityCountRow>(
        db,
        `
            SELECT COUNT(*) AS activity_count
            FROM activities a
            INNER JOIN corpora c ON c.uuid = a.corpus_uuid
            WHERE c.project_uuid = ?
              AND a.activity_type = ?
        `,
        [projectUuid, activityType]
    );

    return row?.activity_count ?? 0;
}

export function listActivityDetailsRowsByProjectUuidAndType(
    db: SqliteDatabase,
    projectUuid: string,
    activityType: string,
): ActivityDetailsRow[] {
    return queryAll<ActivityDetailsRow>(
        db,
        `
            SELECT
                a.uuid AS activity_id,
                a.activity_name AS activity_name,
                a.activity_type AS activity_type,
                at.display_name AS activity_type_display_name,
                COALESCE(s.description, '') AS description
            FROM activities a
            INNER JOIN corpora c ON c.uuid = a.corpus_uuid
            INNER JOIN activity_types at ON at.activity_type = a.activity_type
            LEFT JOIN activities_summaries s ON s.activity_uuid = a.uuid
            WHERE c.project_uuid = ?
              AND a.activity_type = ?
            ORDER BY a.created_at ASC
        `,
        [projectUuid, activityType]
    );
}

export function insertActivityRow(db: SqliteDatabase, row: NewActivityRow): void {
    executeRun(
        db,
        `
            INSERT INTO activities (
                uuid,
                corpus_uuid,
                activity_name,
                activity_type,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
            row.uuid,
            row.corpus_uuid,
            row.activity_name,
            row.activity_type,
            row.created_at,
            row.updated_at,
        ]
    );
}

export function insertActivitySummaryRow(db: SqliteDatabase, row: NewActivitySummaryRow): void {
    executeRun(
        db,
        `
            INSERT INTO activities_summaries (
                uuid,
                activity_uuid,
                description,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?)
        `,
        [
            row.uuid,
            row.activity_uuid,
            row.description,
            row.created_at,
            row.updated_at,
        ]
    );
}
