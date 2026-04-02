import { useEffect, useState } from "react";
import type { ApiProviderModelItem, ApiProviderSettingsItem, LlmProviderName } from "@/app/ports/settings.ports";

type ProviderRowProps = {
    provider: ApiProviderSettingsItem;
    models: ApiProviderModelItem[];
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

const ProviderRow = ({
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
}: ProviderRowProps) => {
    const [isEditingKey, setIsEditingKey] = useState(!provider.hasStoredKey);
    const saveDisabled = apiKeyDraft.trim().length === 0 || isSaving;
    const rowBusy = isSaving || isDeleting || isUpdatingModel || isSettingDefault;

    useEffect(() => {
        if (!provider.hasStoredKey) {
            setIsEditingKey(true);
            return;
        }

        if (!isSaving && apiKeyDraft.trim() === "") {
            setIsEditingKey(false);
        }
    }, [apiKeyDraft, isSaving, provider.hasStoredKey]);

    function handleStartEditingKey() {
        setIsEditingKey(true);
    }

    function handleCancelEditingKey() {
        onApiKeyDraftChange(provider.provider, "");
        setIsEditingKey(false);
    }

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
                    {provider.maskedApiKey && !isEditingKey ? (
                        <button
                            type="button"
                            className="llm-settings-masked-key-button"
                            onClick={handleStartEditingKey}
                        >
                            <span className="llm-settings-masked-key-label">Stored key:</span> {provider.maskedApiKey}
                        </button>
                    ) : null}
                    {isEditingKey ? (
                        <label>
                            <span className="llm-settings-visually-hidden">{`API key for ${provider.displayName}`}</span>
                            <input
                                className="llm-settings-key-input form-control"
                                type="password"
                                value={apiKeyDraft}
                                onChange={(event) => onApiKeyDraftChange(provider.provider, event.target.value)}
                                placeholder={provider.hasStoredKey ? "Replace saved API key" : "Add API key"}
                                autoComplete="off"
                                spellCheck={false}
                                autoFocus
                            />
                        </label>
                    ) : null}
                    <div className="llm-settings-key-actions">
                        {isEditingKey ? (
                            <>
                                <button
                                    className="button-primary button-size-sm"
                                    type="button"
                                    disabled={saveDisabled}
                                    onClick={() => void onSaveKey(provider.provider)}
                                >
                                    {isSaving ? "Saving..." : provider.hasStoredKey ? "Update key" : "Save key"}
                                </button>
                                {provider.hasStoredKey ? (
                                    <button
                                        className="llm-settings-button-ghost button-secondary button-size-sm"
                                        type="button"
                                        disabled={isSaving}
                                        onClick={handleCancelEditingKey}
                                    >
                                        Cancel
                                    </button>
                                ) : null}
                            </>
                        ) : null}
                        <button
                            className="llm-settings-button-ghost button-secondary button-size-sm"
                            type="button"
                            disabled={!provider.hasStoredKey || isDeleting}
                            onClick={() => void onDeleteKey(provider.provider)}
                        >
                            {isDeleting ? "Deleting..." : "Delete key"}
                        </button>
                    </div>
                </div>
            </td>

            <td>
                <div className="llm-settings-model-stack">
                    <label>
                        <span className="llm-settings-visually-hidden">{`Model for ${provider.displayName}`}</span>
                        <select
                            className="llm-settings-model-select form-control form-select"
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
                </div>
            </td>
        </tr>
    );
};

export default ProviderRow;
