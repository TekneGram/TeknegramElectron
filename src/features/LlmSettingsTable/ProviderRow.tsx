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
                    {provider.maskedApiKey ? (
                        <p className="llm-settings-masked-key">Stored key: {provider.maskedApiKey}</p>
                    ) : null}
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
                            {isSaving ? "Saving..." : provider.hasStoredKey ? "Update key" : "Save key"}
                        </button>
                        <button
                            className="llm-settings-button llm-settings-button-ghost"
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
