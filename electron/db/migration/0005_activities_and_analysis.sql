PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS activity_types (
    activity_type TEXT PRIMARY KEY NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

INSERT OR IGNORE INTO activity_types (
    activity_type,
    display_name,
    description,
    created_at,
    updated_at
) VALUES
    (
        'lb_activities',
        'Lexical Bundles Activity',
        'An activity rendered with the Lexical Bundles Activities UI',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS activities (
    uuid TEXT PRIMARY KEY NOT NULL CHECK (length(uuid) = 36),
    corpus_uuid TEXT NOT NULL,
    activity_name TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (corpus_uuid) REFERENCES corpora(uuid) ON DELETE CASCADE,
    FOREIGN KEY (activity_type) REFERENCES activity_types(activity_type)
);

CREATE TABLE IF NOT EXISTS activities_summaries (
    uuid TEXT PRIMARY KEY NOT NULL CHECK (length(uuid) = 36),
    activity_uuid TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (activity_uuid) REFERENCES activities(uuid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS analysis_types (
    analysis_type TEXT PRIMARY KEY NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

INSERT OR IGNORE INTO analysis_types (
    analysis_type,
    display_name,
    description,
    created_at,
    updated_at
) VALUES 
    ('corpus_sampler', 'Corpus Sampler', 'Select samples of documents from a corpus', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('lb_extraction', 'Extract Lexical Bundles', 'Extract lexical bundles from a sample of documents', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('lb_analysis', 'Analyze Extracted Lexical Bundles', 'Analyze the robustness of the extracted lexical bundles across samples', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

CREATE TABLE IF NOT EXISTS analysis (
    uuid TEXT PRIMARY KEY NOT NULL CHECK (length(uuid) = 36),
    analysis_type TEXT NOT NULL,
    activity_uuid TEXT NOT NULL,
    analysis_name TEXT NOT NULL,
    path_to_config TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (analysis_type) REFERENCES analysis_types(analysis_type),
    FOREIGN KEY (activity_uuid) REFERENCES activities(uuid) ON DELETE CASCADE
);