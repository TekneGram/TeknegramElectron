PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO activity_types (
    activity_type,
    display_name,
    description,
    created_at,
    updated_at
) VALUES
    (
        'vocab_activities',
        'Vocabulary Activity',
        'An activity focused on vocabulary patterns and lexical usage.',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'collocation_activities',
        'Collocation Activity',
        'An activity focused on collocation discovery and analysis.',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'dependency_activities',
        'Dependency Activity',
        'An activity focused on dependency structure analysis.',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

UPDATE activities
SET
    activity_type = 'vocab_activities',
    updated_at = CURRENT_TIMESTAMP
WHERE activity_type = 'explore_activities';

DELETE FROM activity_types
WHERE activity_type = 'explore_activities';
