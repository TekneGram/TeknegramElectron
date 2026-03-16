import type { SqliteDatabase } from "../sqlite";
import { queryAll, queryOne, executeRun } from "../sqlite";

export type ApiProviderRow = {
    provider: string;
    display_name: string;
    default_model: string;
    is_default: number;
    has_stored_key: number;
    created_at: string;
    updated_at: string;
}

export type ApiProviderModelRow = {
    provider: string;
    model_id: string;
    display_name: string;
    created_at: string;
    updated_at: string;
}

export type UpdateApiProviderModelRow = {
    provider: string;
    default_model: string;
    updated_at: string;
}

export type UpdateApiProviderStoredKeyStatusRow = {
    provider: string;
    has_stored_key: number;
    updated_at: string;
}

export type SetDefaultApiProviderRow = {
    provider: string;
    updated_at: string;
}

export function listApiProvidersRows(db: SqliteDatabase): ApiProviderRow[] {
    return queryAll<ApiProviderRow>(
        db,
        `SELECT provider, display_name, default_model, is_default, has_stored_key, created_at, updated_at
        FROM api_providers
        ORDER BY display_name ASC
        `
    );
}

export function listApiProviderModelsRows(db: SqliteDatabase): ApiProviderModelRow[] {
    return queryAll<ApiProviderModelRow>(
        db,
        `
            SELECT provider, model_id, display_name, created_at, updated_at
            FROM api_provider_models
            ORDER BY provider ASC, display_name ASC
        `
    );
}

export function getApiProviderByName(
    db: SqliteDatabase,
    provider: string
): ApiProviderRow | undefined {
    return queryOne<ApiProviderRow> (
        db,
        `
            SELECT provider, display_name, default_model, is_default, has_stored_key, created_at, updated_at
            FROM api_providers
            WHERE provider = ?
        `,
        [provider]
    );
}

export function getDefaultApiProvider(db: SqliteDatabase): ApiProviderRow | undefined {
    return queryOne<ApiProviderRow>(
        db,
        `
            SELECT provider, display_name, default_model, is_default, has_stored_key, created_at, updated_at
            FROM api_providers
            WHERE is_default = 1
            LIMIT 1
        `
    );
}

export function getApiProviderModelById(
    db: SqliteDatabase,
    provider: string,
    modelId: string
): ApiProviderModelRow | undefined {
    return queryOne<ApiProviderModelRow>(
        db,
        `
            SELECT provider, model_id, display_name, created_at, updated_at
            FROM api_provider_models
            WHERE provider = ? AND model_id = ?
        `,
        [provider, modelId]
    );
}

export function updateApiProviderModel(
    db: SqliteDatabase,
    row: UpdateApiProviderModelRow
): void {
    executeRun(
        db,
        `
            UPDATE api_providers
            SET default_model = ?, updated_at = ?
            WHERE provider = ?
        `,
        [row.default_model, row.updated_at, row.provider]
    );
}

export function updateApiProviderStoredKeyStatus(
    db: SqliteDatabase,
    row: UpdateApiProviderStoredKeyStatusRow
): void {
    executeRun(
        db,
        `
            UPDATE api_providers
            SET has_stored_key = ?, updated_at = ?
            WHERE provider = ?
        `,
        [row.has_stored_key, row.updated_at, row.provider]
    );
}

export function clearDefaultApiProvider(
    db: SqliteDatabase,
    updatedAt: string
): void {
    executeRun(
        db,
        `
            UPDATE api_providers
            SET is_default = 0, updated_at = ?
            WHERE is_default = 1
        `,
        [updatedAt]
    );
}

export function setDefaultApiProvider(
    db: SqliteDatabase,
    row: SetDefaultApiProviderRow
): void {
    executeRun(
        db,
        `
            UPDATE api_providers
            SET is_default = 1, updated_at = ?
            WHERE provider = ?
        `,
        [row.updated_at, row.provider]
    );
}
