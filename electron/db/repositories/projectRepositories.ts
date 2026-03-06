import { queryAll, openDatabase, type SqliteDatabase } from "../sqlite";

type ProjectListDto = {
    uuid: string;
    projectName: string;
    createdAt: string;
};

interface ProjectRow {
    uuid: string;
    project_name: string;
    created_at: string;
}

export interface ProjectsRepository {
    getAllProjects(): Promise<ProjectListDto[]>;
}

export function createProjectsRepository(dbPath: string): ProjectsRepository {
    return {
        async getAllProjects() {
            const db: SqliteDatabase = openDatabase(dbPath);
            return queryAll<ProjectRow>(
                db,
                "SELECT uuid, project_name, created_at FROM projects ORDER BY project_name ASC;",
            ).map((row) => ({
                uuid: row.uuid,
                projectName: row.project_name,
                createdAt: row.created_at
            }));
        },
    }
}