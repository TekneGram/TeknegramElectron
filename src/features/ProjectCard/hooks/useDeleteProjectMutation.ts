import { useMutation } from "@tanstack/react-query";
import { projectsAdapter } from "@/app/adapters/projects.adapters";
import type { DeleteProjectRequest, DeleteProjectResponse } from "@/app/ports/projects.ports";
import { submitDeleteProject } from "../services/deleteProject.service";

export function useDeleteProjectMutation() {
    return useMutation<DeleteProjectResponse, Error, DeleteProjectRequest>({
        mutationFn: (request) => submitDeleteProject(projectsAdapter, request),
    });
}
