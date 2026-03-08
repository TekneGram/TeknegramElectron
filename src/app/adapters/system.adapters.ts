import type { PickCorpusFolderResponse, SystemPort } from "@/app/ports/system.ports";
import { invokeRequest } from "./invokeRequest";

export const systemAdapter: SystemPort = {
    async pickCorpusFolder() {
        return invokeRequest<null, PickCorpusFolderResponse>("system:pick-corpus-folder", null);
    }
}
