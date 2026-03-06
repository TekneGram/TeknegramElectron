import { useQuery } from "@tanstack/react-query";
import { projectsAdapter } from "@/app/adapters/projects.adapters";
import { listProjects } from "../services/projects.tinyview.service";

export const projectsQueryKey = ["projects"] as const;

export function useListProjectsQuery() {
    return useQuery({
        queryKey: projectsQueryKey,
        queryFn: () => listProjects(projectsAdapter)
    });
}