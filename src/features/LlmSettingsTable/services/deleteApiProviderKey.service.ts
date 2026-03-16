import { toastifyNotifier } from "@/app/adapters/notifications";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type {
    DeleteApiProviderKeyRequest,
    DeleteApiProviderKeyResponse,
    SettingsPort,
} from "@/app/ports/settings.ports";

export async function deleteApiProviderKey(
    port: SettingsPort,
    request: DeleteApiProviderKeyRequest,
): Promise<DeleteApiProviderKeyResponse> {
    const result = await port.deleteApiProviderKey(request);

    if (!result.ok) {
        toastifyNotifier.error(result.error.userMessage, { id: `delete-provider-key-${request.provider}` });
        throw new FrontAppError(result.error);
    }

    toastifyNotifier.success("API key deleted.", { id: `delete-provider-key-${request.provider}` });
    return result.value;
}
