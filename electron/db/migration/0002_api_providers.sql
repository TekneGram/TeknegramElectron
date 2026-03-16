CREATE TABLE api_providers (
    provider TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    default_model TEXT NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1)),
    has_stored_key INTEGER NOT NULL DEFAULT 0 CHECK (has_stored_key IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX idx_api_providers_one_default
ON api_providers (is_default)
WHERE is_default = 1;

INSERT INTO api_providers (
    provider,
    display_name,
    default_model,
    is_default,
    has_stored_key,
    created_at,
    updated_at
) VALUES 
    ('openai', "OpenAi", "gpt-4.1-mini", 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ('anthropic', "Anthropic", "claude-3-5-sonnet-latest", 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ('gemini', "Google Gemini", "gemini-2.5-pro", 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)