import { RegisterProjectHandlers } from "./registerHandlers/register.projects";
import { RegisterActivityHandlers } from "./registerHandlers/register.activities";
import { RegisterAnalysisHandlers } from "./registerHandlers/register.analysis";
import { registerSettingsHandlers } from "./registerHandlers/register.settings";
import { RegisterSystemHandlers } from "./registerHandlers/register.system";

export function registerHandlers(): void {
    RegisterProjectHandlers();
    RegisterActivityHandlers();
    RegisterAnalysisHandlers();
    registerSettingsHandlers();
    RegisterSystemHandlers();
}
