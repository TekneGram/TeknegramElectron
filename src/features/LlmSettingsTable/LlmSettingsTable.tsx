import { useEffect, useState } from "react";
import type { ApiProviderSettingsItem, LlmProviderName } from "@/app/ports/settings.ports";
import "./llmSettingsTable.css";
import { useDeleteApiProviderKeyMutation } from "./hooks/useDeleteApiProviderKeyMutation";
import { useLlmProviderModelsQuery } from "./hooks/useLlmProviderModelsQuery";
import { useLlmProviderSettingsQuery } from "./hooks/useLlmProviderSettingsQuery";
import { useSaveApiProviderKeyMutation } from "./hooks/useSaveApiProviderKeyMutation";
import { useSetDefaultApiProviderMutation } from "./hooks/useSetDefaultApiProviderMutation";
import { useUpdateApiProviderModelMutation } from "./hooks/useUpdateApiProviderModelMutation";

type ApiKeyDrafts = Partial<Record<LlmProviderName, string>>;

const LlmSettingsTable = () => {
    const { data: providers = [], isLoading: providersLoading, isError: providersError, error: providersQueryError } = useLlmProviderSettingsQuery();
    const { data: models = [], isLoading: modelsLoading, isError: modelsError, error: modelsQueryError } = useLlmProviderModelsQuery();

    const saveKeyMutation = useSaveApiProviderKeyMutation();
    const deleteKeyMutation = useDeleteApiProviderKeyMutation();
    const setDefaultMutation = useSetDefaultApiProviderMutation();
    const updateModelMutation = useUpdateApiProviderModelMutation();

    const [apiKeyDrafts, setApiKeyDrafts] = useState<ApiKeyDrafts>({});

    useEffect(() => {
        setApiKeyDrafts((currentDrafts) => {
            const nextDrafts: ApiKeyDrafts = {};

            for (const provider of providers) {
                nextDrafts[provider.provider] = currentDrafts[provider.provider] ?? "";
            }

            return nextDrafts;
        });
    }, [providers]);

    function setApiKeyDraft(provider: LlmProviderName, value: string) {
        setApiKeyDrafts((currentDrafts) => ({
            ...currentDrafts,
            [provider]: value,
        }));
    }

    async function handleSaveKey(provider: LlmProviderName) {
        const nextValue = apiKeyDrafts[provider]?.trim() ?? "";

        if (!nextValue) {
            return;
        }

        try {
            await saveKeyMutation.mutateAsync({
                provider,
                apiKey: nextValue,
            });
            setApiKeyDraft(provider, "");
        } catch {
            return;
        }
    }

    async function handleDeleteKey(provider: LlmProviderName) {
        try {
            await deleteKeyMutation.mutateAsync({ provider });
            setApiKeyDraft(provider, "");
        } catch {
            return;
        }
    }

    async function handleDefaultChange(provider: LlmProviderName) {
        try {
            await setDefaultMutation.mutateAsync({ provider });
        } catch {
            return;
        }
    }

    async function handleModelChange(provider: LlmProviderName, modelId: string) {
        try {
            await updateModelMutation.mutateAsync({
                provider,
                modelId,
            });
        } catch {
            return;
        }
    }

    if (providersLoading || modelsLoading) {
        return (
            <div className="llm-settings-card">
                <div className="llm-settings-card-header">
                    <h2>LLM Provider Settings</h2>
                    <p>Manage provider keys, choose the model to use, and decide which provider powers your workflows.</p>
                </div>
                <p className="llm-settings-state">Loading provider settings…</p>
            </div>
        );
    }

    if (providersError || modelsError) {
        const message = providersQueryError instanceof Error
            ? providersQueryError.message
            : modelsQueryError instanceof Error
                ? modelsQueryError.message
                : "Unable to load LLM settings.";

        return (
            <div className="llm-settings-card">
                <div className="llm-settings-card-header">
                    <h2>LLM Provider Settings</h2>
                    <p>Manage provider keys, choose the model to use, and decide which provider powers your workflows.</p>
                </div>
                <p className="llm-settings-state is-error">{message}</p>
            </div>
        );
    }

    return (
        <div className="llm-settings-card">
            <div className="llm-settings-card-header">
                <h2>LLM Provider Settings</h2>
                <p>Save one API key per provider, choose a supported model for each provider, and select the provider your workflows should use by default.</p>
            </div>

            <div className="llm-settings-table-shell">
                <table className="llm-settings-table">
                    <thead>
                        <tr>
                            <th scope="col">Provider</th>
                            <th scope="col">API key</th>
                            <th scope="col">Model</th>
                            <th scope="col">Default workflow provider</th>
                        </tr>
                    </thead>
                    <tbody>
                        {providers.map((providerRow) => (
                            <ProviderRow
                                key={providerRow.provider}
                                provider={providerRow}
                                models={models.filter((model) => model.provider === providerRow.provider)}
                                apiKeyDraft={apiKeyDrafts[providerRow.provider] ?? ""}
                                isDeleting={deleteKeyMutation.isPending && deleteKeyMutation.variables?.provider === providerRow.provider}
                                isSaving={saveKeyMutation.isPending && saveKeyMutation.variables?.provider === providerRow.provider}
                                isSettingDefault={setDefaultMutation.isPending && setDefaultMutation.variables?.provider === providerRow.provider}
                                isUpdatingModel={updateModelMutation.isPending && updateModelMutation.variables?.provider === providerRow.provider}
                                onApiKeyDraftChange={setApiKeyDraft}
                                onDeleteKey={handleDeleteKey}
                                onModelChange={handleModelChange}
                                onSaveKey={handleSaveKey}
                                onSetDefault={handleDefaultChange}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

type ProviderRowProps = {
    provider: ApiProviderSettingsItem;
    models: Array<{ provider: LlmProviderName; modelId: string; displayName: string }>;
    apiKeyDraft: string;
    isSaving: boolean;
    isDeleting: boolean;
    isUpdatingModel: boolean;
    isSettingDefault: boolean;
    onApiKeyDraftChange: (provider: LlmProviderName, value: string) => void;
    onSaveKey: (provider: LlmProviderName) => Promise<void>;
    onDeleteKey: (provider: LlmProviderName) => Promise<void>;
    onSetDefault: (provider: LlmProviderName) => Promise<void>;
    onModelChange: (provider: LlmProviderName, modelId: string) => Promise<void>;
};

function ProviderRow({
    provider,
    models,
    apiKeyDraft,
    isSaving,
    isDeleting,
    isUpdatingModel,
    isSettingDefault,
    onApiKeyDraftChange,
    onSaveKey,
    onDeleteKey,
    onSetDefault,
    onModelChange,
}: ProviderRowProps) {
    const saveDisabled = apiKeyDraft.trim().length === 0 || isSaving;
    const rowBusy = isSaving || isDeleting || isUpdatingModel || isSettingDefault;

    return (
        <tr>
            <td className="llm-settings-provider-cell">
                <span className="llm-settings-provider-name">{provider.displayName}</span>
                <span className="llm-settings-provider-slug">{provider.provider}</span>
                <span className={`llm-settings-provider-status ${provider.hasStoredKey ? "" : "is-missing"}`}>
                    {provider.hasStoredKey ? "Key saved" : "Key missing"}
                </span>
            </td>

            <td>
                <div className="llm-settings-key-stack">
                    <p className="llm-settings-masked-key">
                        {provider.maskedApiKey ? `Stored key: ${provider.maskedApiKey}` : "No API key saved yet."}
                    </p>
                    <label>
                        <span className="llm-settings-visually-hidden">{`API key for ${provider.displayName}`}</span>
                        <input
                            className="llm-settings-key-input"
                            type="password"
                            value={apiKeyDraft}
                            onChange={(event) => onApiKeyDraftChange(provider.provider, event.target.value)}
                            placeholder={provider.hasStoredKey ? "Replace saved API key" : "Add API key"}
                            autoComplete="off"
                            spellCheck={false}
                        />
                    </label>
                    <div className="llm-settings-key-actions">
                        <button
                            className="llm-settings-button llm-settings-button-primary"
                            type="button"
                            disabled={saveDisabled}
                            onClick={() => void onSaveKey(provider.provider)}
                        >
                            {isSaving ? "Saving…" : provider.hasStoredKey ? "Update key" : "Save key"}
                        </button>
                        <button
                            className="llm-settings-button llm-settings-button-ghost"
                            type="button"
                            disabled={!provider.hasStoredKey || isDeleting}
                            onClick={() => void onDeleteKey(provider.provider)}
                        >
                            {isDeleting ? "Deleting…" : "Delete key"}
                        </button>
                    </div>
                </div>
            </td>

            <td>
                <div className="llm-settings-model-stack">
                    <label>
                        <span className="llm-settings-visually-hidden">{`Model for ${provider.displayName}`}</span>
                        <select
                            className="llm-settings-model-select"
                            value={provider.defaultModel}
                            disabled={models.length === 0 || isUpdatingModel}
                            onChange={(event) => void onModelChange(provider.provider, event.target.value)}
                        >
                            {models.length === 0 ? (
                                <option value="">No curated models available</option>
                            ) : null}
                            {models.map((model) => (
                                <option key={model.modelId} value={model.modelId}>
                                    {model.displayName}
                                </option>
                            ))}
                        </select>
                    </label>
                    <p className="llm-settings-hint">
                        {isUpdatingModel ? "Saving model selection…" : "Choose the model this provider should use."}
                    </p>
                </div>
            </td>

            <td>
                <div className="llm-settings-default-stack">
                    <label className="llm-settings-radio">
                        <input
                            type="radio"
                            name="default-llm-provider"
                            checked={provider.isDefault}
                            disabled={!provider.hasStoredKey || rowBusy}
                            onChange={() => void onSetDefault(provider.provider)}
                        />
                        <span>{provider.isDefault ? "Used for workflows" : "Use this provider"}</span>
                    </label>
                    <p className="llm-settings-radio-note">
                        {!provider.hasStoredKey
                            ? "Add a key before this provider can be used by default."
                            : isSettingDefault
                                ? "Updating workflow default…"
                                : provider.isDefault
                                    ? "This provider will be used unless a workflow overrides it."
                                    : "Select to make this the default provider for inference."}
                    </p>
                </div>
            </td>
        </tr>
    );
}

export default LlmSettingsTable;
