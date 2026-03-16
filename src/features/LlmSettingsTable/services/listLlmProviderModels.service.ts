import { FrontAppError } from "@/app/errors/FrontAppError";
import type { ApiProviderModelItem, SettingsPort } from "@/app/ports/settings.ports";

export async function listLlmProviderModels(port: SettingsPort): Promise<ApiProviderModelItem[]> {
    const result = await port.listApiProviderModels();

    if (!result.ok) {
        throw new FrontAppError(result.error);
    }

    return result.value.models;
}
