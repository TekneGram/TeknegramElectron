import TeknegramIcon from './MainView/TeknegramIcon';
import '@/styles/layout.css';
import { useListProjectsQuery } from '@/features/ProjectsTinyView/hooks/useProjectsQuery';
import CreateProjectModal from '@/features/CreateProjectModal/CreateProjectModal';
import { useState, useEffect } from 'react';
import CreateSuccessTransition from './MainView/CreateSuccessTransition';
import ProjectsList from './MainView/ProjectsList';

interface MainViewProps {
    modalIsOpen: boolean;
    onOpenModal: () => void;
    onCloseModal: () => void;
}

type MainViewState = 
        | { kind: "welcome" }
        | { kind: "create-success-transition" }
        | { kind: "projects-list" };

const MainView: React.FC<MainViewProps> = ({ onOpenModal, onCloseModal, modalIsOpen }) => {

    const { data, isLoading, isError, refetch } = useListProjectsQuery();
    const [viewState, setViewState] = useState<MainViewState>({ kind: "welcome" });

    function handleSuccessfulCreation() {
        onCloseModal(); // Close the modal if a project is successfully created.
        setViewState({ kind: "create-success-transition" });
    }


    // Observe viewState to create a transition screen
    useEffect(() => {
        if(viewState.kind !== "create-success-transition") return;

        const timeoutId = window.setTimeout(() => {
            refetch();
        }, 1000);

        return() => window.clearTimeout(timeoutId);
    }, [viewState, refetch]);

    // Observe viewState to reach the projects-list screen
    useEffect(() => {
        if (viewState.kind !== "create-success-transition") {
            return;
        }

        if (data !== undefined && data.length > 0) {
            setViewState({ kind: "projects-list" });
        }
    }, [viewState, data]);

    // Screen to show when loading the projects
    if (isLoading) {
        return(<p>Loading!</p>);
    }

    // Screen to show if there was an error loading the projects
    if (isError) {
        return(<p>Something went badly wrong!</p>);
    }

    // A transition screen after successfully creating a project.
    if (viewState.kind === "create-success-transition") {
        return(
            <CreateSuccessTransition />
        );
    }

    // const data2 = [
    //         {
    //             projectName: "BAWE Project",
    //             uuid: "123-123-123-123-123-123",
    //             createdAt: "some data"
    //         },
    //         {
    //             projectName: "BNC Project",
    //             uuid: "123-123-123-123-123-124",
    //             createdAt: "some data"
    //         },
    //         {
    //             projectName: "CEFR Levels Corpus",
    //             uuid: "123-123-123-123-123-125",
    //             createdAt: "some data"
    //         },
    //         {
    //             projectName: "CEFR Levels Corpus",
    //             uuid: "123-123-123-123-123-126",
    //             createdAt: "some data"
    //         },
    //         {
    //             projectName: "CEFR Levels Corpus",
    //             uuid: "123-123-123-123-123-127",
    //             createdAt: "some data"
    //         },
    //         {
    //             projectName: "CEFR Levels Corpus",
    //             uuid: "123-123-123-123-123-128",
    //             createdAt: "some data"
    //         },
    //         {
    //             projectName: "CEFR Levels Corpus",
    //             uuid: "123-123-123-123-123-129",
    //             createdAt: "some data"
    //         },
    //         {
    //             projectName: "CEFR Levels Corpus",
    //             uuid: "123-123-123-123-123-130",
    //             createdAt: "some data"
    //         },
    //         {
    //             projectName: "CEFR Levels Corpus",
    //             uuid: "123-123-123-123-123-131",
    //             createdAt: "some data"
    //         }
    //     ]

    if (data === undefined || data.length === 0) {
        
        return(
            <section className="main-view-welcome">
                <div className="main-view-welcome-card">
                    <div className="title">
                        <h1>Teknegram</h1>
                    </div>
                    <div className="welcome-message">
                        <p>Advanced Corpus Linguistics Search and Analytics</p>
                        <p>Start a new project to build a corpus and explore your data.</p>
                    </div>
                    <div className="logo-area">
                        <div className="main-view-brand-icon-shell main-view-brand-icon-shell-welcome" aria-hidden="true">
                            <div className="main-view-brand-icon-ring" />
                            <div className="main-view-brand-icon-core main-view-brand-icon-core-welcome">
                                <TeknegramIcon />
                            </div>
                        </div>
                    </div>
                    <div className="welcome-actions">
                        <button 
                            className="main-view-welcome-button"
                            onClick={onOpenModal}
                        >
                            Start New Project
                        </button>
                    </div>
                </div>
                {
                    modalIsOpen ? <CreateProjectModal onClose={onCloseModal} onSuccessfulCreation={handleSuccessfulCreation} /> : <></>
                }
            </section>
            
        );
    }
        
    
    // To the projects list screen
    if (data.length >= 1) {
        return (
            <>
            <ProjectsList projectsData={data} />
            {
                modalIsOpen ? <CreateProjectModal onClose={onCloseModal} onSuccessfulCreation={handleSuccessfulCreation} /> : <></>
            }
            </>
        )
    }
    // if (viewState.kind === "projects-list") {
    //     return (
    //         <>
    //         <ProjectsList projectsData={data} />
    //         {
    //             modalIsOpen ? <CreateProjectModal onClose={onCloseModal} onSuccessfulCreation={handleSuccessfulCreation} /> : <></>
    //         }
    //         </>
            
    //     )
    // }

    return (
        <></>
    );
};

export default MainView;
