import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsAdapter } from "@/app/adapters/projects.adapters";
import { submitCreateProject } from "../services/createProjectModal.service";
import { CreateProjectRequest, CreateProjectResponse } from "@/app/ports/projects.ports"

const useCreateProjectMutation = () => {
    const queryClient = useQueryClient();

    return useMutation<CreateProjectResponse, Error, CreateProjectRequest>({
        mutationFn: (request) => submitCreateProject(projectsAdapter, request),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["projects"] });
        }
    });
};

export default useCreateProjectMutation;