PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO activity_types (
    activity_type,
    display_name,
    description,
    created_at,
    updated_at
) VALUES (
    'explore_activities',
    'Corpus exploration activity',
    'And activity rendered with the Exploration Activities UI',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);