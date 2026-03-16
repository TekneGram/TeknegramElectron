import { FrontAppError } from "@/app/errors/FrontAppError";
import type { ApiProviderSettingsItem, SettingsPort } from "@/app/ports/settings.ports";

export async function listLlmProviderSettings(port: SettingsPort): Promise<ApiProviderSettingsItem[]> {
    const result = await port.listApiProviders();

    if (!result.ok) {
        throw new FrontAppError(result.error);
    }

    return result.value.providers;
}
