import TeknegramIcon from './MainView/TeknegramIcon';
import '@/styles/layout.css';
import { useListProjectsQuery } from '@/features/ProjectsTinyView/hooks/useProjectsQuery';
import CreateProjectModal from '@/features/CreateProjectModal/CreateProjectModal';
import { useState, useEffect } from 'react';

interface MainViewProps {
    modalIsOpen: boolean;
    onOpenModal: () => void;
    onCloseModal: () => void;
}

type MainViewState = 
        | "welcome"
        | "create-success-transition"
        | "projects";

const MainView: React.FC<MainViewProps> = ({ onOpenModal, onCloseModal, modalIsOpen }) => {

    const { data, isLoading, isError, refetch } = useListProjectsQuery();
    const [viewState, setViewState] = useState<MainViewState>("welcome");

    function handleSuccessfulCreation() {
        onCloseModal(); // Close the modal if a project is successfully created.
        setViewState("create-success-transition");
    }


    // Observe viewState to create a transition screen
    useEffect(() => {
        if(viewState !== "create-success-transition") return;

        const timeoutId = window.setTimeout(() => {
            refetch();
        }, 1000);

        return() => window.clearTimeout(timeoutId);
    }, [viewState, refetch]);

    useEffect(() => {
        if (viewState !== "create-success-transition") {
            return;
        }

        if (data !== undefined && data.length > 0) {
            setViewState("projects");
        }
    }, [viewState, data]);

    if (isLoading) {
        return(<p>Loading!</p>);
    }

    if (isError) {
        return(<p>Something went badly wrong!</p>);
    }

    if (viewState === "create-success-transition") {
        return(
            <section className="main-view-transition">
                <div className="main-view-transition-card">
                    <div className="main-view-transition-badge">Project Created</div>
                    <div className="main-view-transition-icon-shell" aria-hidden="true">
                        <div className="main-view-transition-icon-ring" />
                        <div className="main-view-transition-icon-core">
                            <TeknegramIcon />
                        </div>
                    </div>
                    <div className="main-view-transition-copy">
                        <h1>Corpus created successfully.</h1>
                        <p>
                            Teknegram is refreshing your projects so you can jump straight into the new workspace.
                        </p>
                    </div>
                    <div className="main-view-transition-progress" aria-hidden="true">
                        <span className="main-view-transition-progress-bar" />
                    </div>
                    <p className="main-view-transition-status">
                        Preparing project selection view...
                    </p>
                </div>
            </section>
        );
    }

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
                        <TeknegramIcon />
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

    return (
        <section className="main-view">
            <div>
                <p>Projects will get rendered here!</p>
            </div>
        </section>
    );
};

export default MainView;
