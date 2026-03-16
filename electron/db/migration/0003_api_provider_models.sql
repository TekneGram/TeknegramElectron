CREATE TABLE api_provider_models (
    provider TEXT NOT NULL,
    model_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (provider, model_id),
    FOREIGN KEY (provider) REFERENCES api_providers(provider) ON DELETE CASCADE
);

INSERT INTO api_provider_models (
    provider,
    model_id,
    display_name,
    created_at,
    updated_at
) VALUES
    ('openai', 'gpt-5-mini', 'GPT-5 mini', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('openai', 'gpt-5-nano', 'GPT-5 nano', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('gemini', 'gemini-2.5-flash', 'Gemini 2.5 Flash', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('gemini', 'gemini-2.5-flash-lite', 'Gemini 2.5 Flash-Lite', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('anthropic', 'claude-sonnet-4-6', 'Claude Sonnet 4.6', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('anthropic', 'claude-haiku-4-5-20251001', 'Claude Haiku 4.5', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
