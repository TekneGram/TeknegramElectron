import { z } from "zod";
import type { CreateProjectRequest } from "../contracts/projects.contracts";

export const createProjectSchema: z.ZodType<CreateProjectRequest> = z.object({
    projectName: z.string().min(1),
    corpusName: z.string().min(1),
    folderPath: z.string().min(1),
    semanticsRulesPath: z.string().min(1).optional(),
});