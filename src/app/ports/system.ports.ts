import type { AppResult } from "../types/result";

export interface PickCorpusFolderResponse {
    folderPath: string | null;
}

export interface SystemPort {
    pickCorpusFolder(): Promise<AppResult<PickCorpusFolderResponse>>;
}