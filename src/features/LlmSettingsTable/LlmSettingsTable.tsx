import { useEffect, useState } from "react";
import type { LlmProviderName } from "@/app/ports/settings.ports";
import "./llmSettingsTable.css";
import "@/styles/button-styles.css";
import "@/styles/forms.css";
import "@/styles/shells.css";
import { useDeleteApiProviderKeyMutation } from "./hooks/useDeleteApiProviderKeyMutation";
import { useLlmProviderModelsQuery } from "./hooks/useLlmProviderModelsQuery";
import { useLlmProviderSettingsQuery } from "./hooks/useLlmProviderSettingsQuery";
import { useSaveApiProviderKeyMutation } from "./hooks/useSaveApiProviderKeyMutation";
import { useSetDefaultApiProviderMutation } from "./hooks/useSetDefaultApiProviderMutation";
import { useUpdateApiProviderModelMutation } from "./hooks/useUpdateApiProviderModelMutation";
import ProviderRow from "./ProviderRow";

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
            <div className="llm-settings-card shell-panel shell-radius-5xl shell-surface-soft shell-shadow-lg shell-highlight">
                <div className="llm-settings-card-header">
                    <h2>LLM Provider Settings</h2>
                </div>
                <p className="llm-settings-state">Loading provider settings...</p>
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
            <div className="llm-settings-card shell-panel shell-radius-5xl shell-surface-soft shell-shadow-lg shell-highlight">
                <div className="llm-settings-card-header">
                    <h2>LLM Provider Settings</h2>
                </div>
                <p className="llm-settings-state is-error">{message}</p>
            </div>
        );
    }

    return (
        <div className="llm-settings-card shell-panel shell-radius-5xl shell-surface-soft shell-shadow-lg shell-highlight">
            <div className="llm-settings-card-header">
                <h2>LLM Provider Settings</h2>
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

export default LlmSettingsTable;
