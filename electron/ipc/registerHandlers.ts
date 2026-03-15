import { RegisterProjectHandlers } from "./registerHandlers/register.projects";
import { RegisterSystemHandlers } from "./registerHandlers/register.system";

export function registerHandlers(): void {
    RegisterProjectHandlers();
    RegisterSystemHandlers();
}
