import { ProjectListItem } from "@/app/ports/projects.ports";
import ProjectCard from "@/features/ProjectCard/ProjectCard";
import { useNavigation } from "@/app/providers/useNavigation";
import "@/styles/text-style.css";

interface ProjectsListProps {
    projectsData: ProjectListItem[];
}

const ProjectsList: React.FC<ProjectsListProps> = ({ projectsData }) => {

    const { dispatch } = useNavigation();

    const handleNavigateToActivities = (projectId: string, projectName: string) => {
        dispatch({ type: "enter-activities", projectId: projectId, projectName: projectName });
    };

    return (
        <section className="projects-screen main-view-grid-surface">
            <div className="projects-screen-header">
                <div className="projects-screen-header-copy">
                    <p className="eyebrow-text eyebrow-text-md">Projects</p>
                    <h1>Corpus Projects</h1>
                    <p className="projects-screen-intro">
                        Pick a project to continue your analysis, review imported texts, or move deeper into the workspace.
                    </p>
                </div>
            </div>
            <div className="projects-grid">
                {
                    projectsData.map((project) => {
                        return(
                        <ProjectCard
                            key={project.uuid}
                            project={project}
                            onNavigateToActivities={handleNavigateToActivities}
                        />
                        );
                    })
                }
            </div>
        </section>
    );
};

export default ProjectsList;
