import { toastifyNotifier } from "@/app/adapters/notifications";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type {
    SetDefaultApiProviderRequest,
    SetDefaultApiProviderResponse,
    SettingsPort,
} from "@/app/ports/settings.ports";

export async function setDefaultApiProvider(
    port: SettingsPort,
    request: SetDefaultApiProviderRequest,
): Promise<SetDefaultApiProviderResponse> {
    const result = await port.setDefaultApiProvider(request);

    if (!result.ok) {
        toastifyNotifier.error(result.error.userMessage, { id: `set-default-provider-${request.provider}` });
        throw new FrontAppError(result.error);
    }

    toastifyNotifier.success("Default provider updated.", { id: `set-default-provider-${request.provider}` });
    return result.value;
}
