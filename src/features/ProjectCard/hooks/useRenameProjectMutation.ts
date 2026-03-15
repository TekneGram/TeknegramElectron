import { useMutation } from "@tanstack/react-query";
import { projectsAdapter } from "@/app/adapters/projects.adapters";
import type {
    UpdateProjectNameRequest,
    UpdateProjectNameResponse,
} from "@/app/ports/projects.ports";
import { submitUpdateProjectName } from "../services/updateProjectName.service";

export function useRenameProjectMutation() {
    return useMutation<UpdateProjectNameResponse, Error, UpdateProjectNameRequest>({
        mutationFn: (request) => submitUpdateProjectName(projectsAdapter, request),
    });
}
