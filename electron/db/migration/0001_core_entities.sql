PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS projects (
    uuid TEXT PRIMARY KEY NOT NULL CHECK (length(uuid) = 36),
    project_name TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS corpora (
    uuid TEXT PRIMARY KEY NOT NULL CHECK (length(uuid) = 36),
    project_uuid TEXT NOT NULL,
    corpus_name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (project_uuid) REFERENCES projects(uuid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS corpus_files_path (
    uuid TEXT PRIMARY KEY NOT NULL CHECK (length(uuid) = 36),
    corpus_uuid TEXT NOT NULL,
    binary_files_path TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (corpus_uuid) REFERENCES corpora(uuid) ON DELETE CASCADE
);