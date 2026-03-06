import { useState } from "react";
import { useListProjectsQuery } from "./hooks/useProjectsQuery";
import "./projectsTinyView.css";

const ProjectsTinyView = () => {
    
    const { data, isLoading, isError } = useListProjectsQuery();
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");

    if (isLoading) {
        return (<p>Loading...</p>);
    }

    if (isError) {
        return (<p>Hmm...</p>);
    }

    if (data === undefined || data.length === 0) {
        return (<button className="projects-tinyview-new">+ New Project</button>);
    }

    return(
        <>
            <select
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
            >
                <option value="" disabled>
                    Projects
                </option>
                {
                    data.map((project) => (
                        <option
                            key={project.uuid}
                            value={project.uuid}
                        >
                            {project.projectName}
                        </option>
                    ))
                }
            </select>
        </>
    )


};

export default ProjectsTinyView;