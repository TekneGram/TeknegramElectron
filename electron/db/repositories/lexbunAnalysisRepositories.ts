import type { SqliteDatabase } from '../sqlite';
import { queryAll, queryOne, executeRun } from "../sqlite";
import { AnalysisType } from '@electron/ipc/contracts/lexbunAnalysis.contracts';

export type CorpusMetadataRow = {
    corpus_uuid: string;
    metadata_json: string;
    summary_text:string;
    llm_provider: string | null;
    llm_model: string | null;
    created_at: string;
    updated_at: string;
}

export type NewAnalysisRow = {
    uuid: string;
    analysis_type: AnalysisType;
    activity_uuid: string;
    analysis_name: string;
    config: string | null;
    created_at: string;
    updated_at: string;
}

export type AnalysisResponseRow = {
    uuid: string;
    analysis_name: string;
    analysis_type: AnalysisType;
    config: string | null;
    display_name: string;
    description: string | null;
}

export function getCorpusMetadataRow(db: SqliteDatabase, corpusUuid: string): CorpusMetadataRow | undefined {
    return queryOne<CorpusMetadataRow> (
        db,
        `
            SELECT corpus_uuid, metadata_json, summary_text, llm_provider, llm_model, created_at, updated_at
            FROM corpus_metadata
            WHERE corpus_uuid = ?
            LIMIT 1
        `,
        [corpusUuid]
    );
}

export function insertAnalysisRow(db: SqliteDatabase, row: NewAnalysisRow): void {
    executeRun(
        db,
        `INSERT INTO analysis (
            uuid,
            analysis_type,
            activity_uuid,
            analysis_name,
            config,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            row.uuid,
            row.analysis_type,
            row.analysis_name,
            row.config,
            row.created_at,
            row.updated_at,
        ]
    );
}

export function getAnalysisResponseByUuid(
    db: SqliteDatabase,
    analysisUuid: string
): AnalysisResponseRow | undefined {
    return queryOne<AnalysisResponseRow>(
        db,
        `
            SELECT
                a.uuid AS uuid,
                a.analysis_name AS analysis_name,
                a.analysis_type AS analysis_type,
                a.config AS config,
                at.display_name AS display_name,
                at.description AS description
            FROM analysis a
            INNER JOIN analysis_types at
                ON at.analysis_type = a.analysis_type
            WHERE a.uuid = ?
            LIMIT 1
        `,
        [analysisUuid]
    );
}

export function getAnalysisResponseByActivityUuid(
    db: SqliteDatabase,
    activityUuid: string
): AnalysisResponseRow[] | undefined {
    return queryAll<AnalysisResponseRow>(
        db,
        `
            SELECT
                a.uuid AS uuid,
                a.analysis_name AS analysis_name,
                a.analysis_type AS analysis_type,
                a.config AS config
                at.display_name AS display_name,
                at.description AS description
            FROM analysis a
            INNER JOIN analysis_types at
                ON at.analysis_type = a.analysis_type
            WHERE a.activity_uuid = ?
        `,
        [activityUuid]
    );
}