import type {
    GetCorpusMetadataRequest,
    GetCorpusMetadataResponse,
    ProjectsPort,
} from "@/app/ports/projects.ports";
import { FrontAppError } from "@/app/errors/FrontAppError";

export async function fetchCorpusMetadata(
    port: ProjectsPort,
    request: GetCorpusMetadataRequest,
): Promise<GetCorpusMetadataResponse> {
    const result = await port.getCorpusMetadata(request);

    if (!result.ok) {
        throw new FrontAppError(result.error);
    }

    return result.value;
}
