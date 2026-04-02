import TeknegramIcon from './icons/TeknegramIcon';
import '@/styles/button-styles.css';
import { useListProjectsQuery } from '@/features/ProjectsTinyView/hooks/useProjectsQuery';
import { useEffect, useRef, useState } from 'react';
import CreateSuccessTransition from './CreateSuccessTransition';
import ProjectsList from './ProjectsList';

type HomeViewState =
    | { kind: "welcome" }
    | { kind: "create-success-transition" }
    | { kind: "projects-list" };

interface HomeViewProps {
    onOpenModal: () => void;
    projectCreationCount: number;
}

const HomeView: React.FC<HomeViewProps> = ({ onOpenModal, projectCreationCount }) => {
    const { data, isLoading, isError, refetch } = useListProjectsQuery();
    const [viewState, setViewState] = useState<HomeViewState>({ kind: "welcome" });
    const previousProjectCreationCount = useRef(projectCreationCount);

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

    useEffect(() => {
        if (projectCreationCount === previousProjectCreationCount.current) {
            return;
        }

        previousProjectCreationCount.current = projectCreationCount;
        setViewState({ kind: "create-success-transition" });
    }, [projectCreationCount]);

    useEffect(() => {
        if (viewState.kind !== "create-success-transition") {
            return;
        }

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

        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, [viewState.kind, refetch]);

    if (viewState.kind === "create-success-transition") {
        return <CreateSuccessTransition />;
    }

    if (isLoading) {
        return <p>Loading!</p>;
    }

    if (isError) {
        return <p>Something went badly wrong!</p>;
    }

    if (viewState.kind === "projects-list") {
        if (!data || data.length === 0) {
            return null;
        }

        return <ProjectsList projectsData={data} />;
    }

    return (
        <section className="main-view-welcome main-view-grid-surface">
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
                        className="button-primary button-size-xl"
                        onClick={onOpenModal}
                    >
                        Start New Project
                    </button>
                </div>
            </div>
        </section>
    );
};

export default HomeView;
