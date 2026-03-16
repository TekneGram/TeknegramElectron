import { toastifyNotifier } from "@/app/adapters/notifications";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type {
    SaveApiProviderKeyRequest,
    SaveApiProviderKeyResponse,
    SettingsPort,
} from "@/app/ports/settings.ports";

export async function saveApiProviderKey(
    port: SettingsPort,
    request: SaveApiProviderKeyRequest,
): Promise<SaveApiProviderKeyResponse> {
    const result = await port.saveApiProviderKey(request);

    if (!result.ok) {
        toastifyNotifier.error(result.error.userMessage, { id: `save-provider-key-${request.provider}` });
        throw new FrontAppError(result.error);
    }

    toastifyNotifier.success("API key saved.", { id: `save-provider-key-${request.provider}` });
    return result.value;
}
