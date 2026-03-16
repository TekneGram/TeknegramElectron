import { RegisterProjectHandlers } from "./registerHandlers/register.projects";
import { registerSettingsHandlers } from "./registerHandlers/register.settings";
import { RegisterSystemHandlers } from "./registerHandlers/register.system";

export function registerHandlers(): void {
    RegisterProjectHandlers();
    registerSettingsHandlers();
    RegisterSystemHandlers();
}
