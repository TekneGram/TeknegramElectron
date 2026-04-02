PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO analysis_types (
    analysis_type,
    display_name,
    description,
    created_at,
    updated_at
) VALUES (
    'metadata_inspection',
    'Corpus metadata inspection',
    'Inspect the document, lemma and word counts for the corpus you built.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);