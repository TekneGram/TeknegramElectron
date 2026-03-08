import { ProjectListItem } from "@/app/ports/projects.ports";
interface ProjectsListProps {
    projectsData: ProjectListItem[];
}

const ProjectsList: React.FC<ProjectsListProps> = ({ projectsData }) => {

    return (
        <section className="projects-screen">
            <div className="projects-screen-header">
                <div className="projects-screen-header-copy">
                    <p className="projects-screen-eyebrow">Projects</p>
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
                        <div
                            className="project-card-shell"
                            key={project.uuid}
                        >
                            <div className="project-card">
                                <div className="project-card-header">
                                    <div className="project-card-badge">Ready</div>
                                    <h2>{project.projectName}</h2>
                                </div>
                                <div className="project-card-body">
                                    <p className="project-card-copy">
                                        Later, put some more interesting text here, e.g., last accessed, or metadata on the corpus or some recent results and stats.
                                    </p>
                                    <div className="project-card-footer">
                                        <button className="project-enter-button">
                                            Enter Project
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        )
                    })
                }
            </div>
        </section>
    );
};

export default ProjectsList;
