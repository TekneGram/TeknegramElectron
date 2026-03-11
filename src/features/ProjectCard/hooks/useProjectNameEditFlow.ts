import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { ProjectListItem } from "@/app/ports/projects.ports";
import { projectsQueryKey } from "@/features/ProjectsTinyView/hooks/useProjectsQuery";
import { useRenameProjectMutation } from "./useRenameProjectMutation";

type ProjectNameEditFlowOptions = {
    projectUuid: string;
    projectName: string;
};

export function useProjectNameEditFlow({ projectUuid, projectName }: ProjectNameEditFlowOptions) {
    const queryClient = useQueryClient();
    const mutation = useRenameProjectMutation();
    const [isEditing, setIsEditing] = useState(false);
    const [draftName, setDraftName] = useState(projectName);

    useEffect(() => {
        if (!isEditing) {
            setDraftName(projectName);
        }
    }, [isEditing, projectName]);

    const trimmedDraftName = useMemo(() => draftName.trim(), [draftName]);
    const canConfirm = trimmedDraftName.length > 0 && trimmedDraftName !== projectName && !mutation.isPending;

    function startEditing() {
        mutation.reset();
        setDraftName(projectName);
        setIsEditing(true);
    }

    function cancelEditing() {
        mutation.reset();
        setDraftName(projectName);
        setIsEditing(false);
    }

    async function confirmEditing() {
        if (!canConfirm) {
            return;
        }

        const updatedProject = await mutation.mutateAsync({
            projectUuid,
            projectName: trimmedDraftName,
        });

        queryClient.setQueryData<ProjectListItem[] | undefined>(projectsQueryKey, (currentProjects) => {
            if (!currentProjects) {
                return currentProjects;
            }

            return currentProjects.map((project) =>
                project.uuid === updatedProject.projectUuid
                    ? { ...project, projectName: updatedProject.projectName }
                    : project
            );
        });
        void queryClient.invalidateQueries({ queryKey: projectsQueryKey });
        setIsEditing(false);
    }

    return {
        error: mutation.error,
        isEditing,
        isSaving: mutation.isPending,
        draftName,
        canConfirm,
        startEditing,
        cancelEditing,
        setDraftName,
        confirmEditing,
    };
}
