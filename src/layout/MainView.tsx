import TeknegramIcon from './MainView/TeknegramIcon';
import '@/styles/layout.css';
import { useListProjectsQuery } from '@/features/ProjectsTinyView/hooks/useProjectsQuery';
import CreateProjectModal from '@/features/CreateProjectModal/CreateProjectModal';
import { useState, useEffect } from 'react';
import CreateSuccessTransition from './MainView/CreateSuccessTransition';
import ProjectsList from './MainView/ProjectsList';
import SettingsView from './MainView/SettingsView';
import type { MainViewRoute } from './MainView/mainViewRoute';

interface MainViewProps {
    modalIsOpen: boolean;
    onOpenModal: () => void;
    onCloseModal: () => void;
    route: MainViewRoute;
}

type MainViewState = 
        | { kind: "welcome" }
        | { kind: "create-success-transition" }
        | { kind: "projects-list" };

const MainView: React.FC<MainViewProps> = ({ onOpenModal, onCloseModal, modalIsOpen, route }) => {

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

    let content: React.ReactNode;

    if (viewState.kind === "create-success-transition") {
        content = <CreateSuccessTransition />;
    } else if (isLoading) {
        if (route === "settings") {
            content = <SettingsView />;
        } else {
            content = <p>Loading!</p>;
        }
    } else if (isError) {
        if (route === "settings") {
            content = <SettingsView />;
        } else {
            content = <p>Something went badly wrong!</p>;
        }
    } else if (route === "settings") {
        content = <SettingsView />;
    } else if (viewState.kind === "welcome") {
        content = (
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
            </section>
        );
    } else if (route === "projects" || viewState.kind === "projects-list") {
        if (!data || data.length === 0) {
            content = null;
        } else {
            content = <ProjectsList projectsData={data} />;
        }
    } else {
        content = <></>;
    }

    return (
        <>
            {content}
            {modalIsOpen ? (
                <CreateProjectModal onClose={onCloseModal} onSuccessfulCreation={handleSuccessfulCreation} />
            ) : null}
        </>
    );
};

export default MainView;
