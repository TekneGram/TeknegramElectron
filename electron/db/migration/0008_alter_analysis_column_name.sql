PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS analysis_new (
    uuid TEXT PRIMARY KEY NOT NULL CHECK (length(uuid) = 36),
    analysis_type TEXT NOT NULL,
    activity_uuid TEXT NOT NULL,
    analysis_name TEXT NOT NULL,
    config TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (analysis_type) REFERENCES analysis_types(analysis_type),
    FOREIGN KEY (activity_uuid) REFERENCES activities(uuid) ON DELETE CASCADE
);

INSERT INTO analysis_new (
    uuid,
    analysis_type,
    activity_uuid,
    analysis_name,
    config,
    created_at,
    updated_at
)
SELECT
    uuid,
    analysis_type,
    activity_uuid,
    analysis_name,
    path_to_config,
    created_at,
    updated_at
FROM analysis;

DROP TABLE analysis;
ALTER TABLE analysis_new RENAME TO analysis;