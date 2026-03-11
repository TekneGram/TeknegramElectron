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

    useEffect(() => {
        if (isLoading || isError) {
            return;
        }

        if (viewState.kind === "create-success-transition") {
            return;
        }

        const nextKind = data && data.length > 0 ? "projects-list" : "welcome";

        if (viewState.kind !== nextKind) {
            setViewState({ kind: nextKind });
        }
    }, [data, isLoading, isError, viewState.kind]);

    function handleSuccessfulCreation() {
        setViewState({ kind: "create-success-transition" });
    }


    // Observe viewState to create a transition screen
    useEffect(() => {
        if(viewState.kind !== "create-success-transition") return;

        let cancelled = false;

        const timeoutId = window.setTimeout(async () => {
            const result = await refetch();

            if (cancelled) {
                return;
            }

            const refreshedData = result.data;

            if (refreshedData !== undefined && refreshedData.length > 0) {
                setViewState({ kind: "projects-list" });
                return;
            }
            
            setViewState({ kind: "welcome" });

        }, 4000);

        return() => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, [viewState.kind, refetch]);

    // A transition screen after successfully creating a project.
    if (viewState.kind === "create-success-transition") {
        return(
            <CreateSuccessTransition />
        );
    }

    // Screen to show when loading the projects
    if (isLoading) {
        return(<p>Loading!</p>);
    }

    // Screen to show if there was an error loading the projects
    if (isError) {
        return(<p>Something went badly wrong!</p>);
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

    if (viewState.kind === "welcome") {
        
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
    if (viewState.kind === "projects-list") {
        if (!data || data.length === 0) {
            return null;
        }

        return (
            <>
            <ProjectsList projectsData={data} />
            {
                modalIsOpen ? <CreateProjectModal onClose={onCloseModal} onSuccessfulCreation={handleSuccessfulCreation} /> : <></>
            }
            </>
        )
    }

    return (
        <></>
    );
};

export default MainView;
