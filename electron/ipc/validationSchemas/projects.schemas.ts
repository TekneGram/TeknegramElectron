import { z } from "zod";
import type { CancelCreateProjectRequest, CreateProjectRequest, DeleteProjectRequest } from "../contracts/projects.contracts";

export const createProjectSchema: z.ZodType<CreateProjectRequest> = z.object({
    requestId: z.string().min(1),
    projectName: z.string().min(1),
    corpusName: z.string().min(1),
    folderPath: z.string().min(1),
    semanticsRulesPath: z.string().min(1).optional(),
});

export const cancelCreateProjectSchema: z.ZodType<CancelCreateProjectRequest> = z.object({
    requestId: z.string().min(1),
})

export const deleteProjectSchema: z.ZodType<DeleteProjectRequest> = z.object({
    projectUuid: z.string().uuid(),
});
