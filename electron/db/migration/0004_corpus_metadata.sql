CREATE TABLE IF NOT EXISTS corpus_metadata (
    corpus_uuid TEXT PRIMARY KEY NOT NULL,
    metadata_json TEXT NOT NULL,
    summary_text TEXT NOT NULL,
    llm_provider TEXT,
    llm_model TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (corpus_uuid) REFERENCES corpora(uuid) ON DELETE CASCADE
);
