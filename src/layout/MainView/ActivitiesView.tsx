import { useNavigation } from "@/app/providers/useNavigation";
import { useActivitiesQuery } from "@/features/Activities/hooks/useActivitiesQuery";
import "./styles/ActivitiesView.css";
import ActivitiesWelcome from "@/features/Activities/ActivitiesWelcome";
import Activities from "@/features/Activities/Activities";
import ActivitiesLoadingTransition from "./ActivitiesLoadingTransition";

const ActivitiesView = () => {
    const { navigationState } = useNavigation();

    if (navigationState.kind !== "activities") {
        return null;
    }

    const { projectId, projectName } = navigationState;
    const activitiesQuery = useActivitiesQuery({
        projectId,
    });

    const activities = activitiesQuery.data?.activities ?? [];
    const corpusName = activitiesQuery.data?.corpusName ?? "Your corpus";

    if (activitiesQuery.isLoading) {
        return <ActivitiesLoadingTransition />
    }

    if (activitiesQuery.isError) {
        return (
            <section className="activities-screen main-view-grid-surface">
                <header className="activities-screen-header">
                    <p className="activities-screen-eyebrow">Corpus Activities</p>
                    <h1>{projectName}</h1>
                    <p className="activities-screen-intro">
                        Teknegram could not load the activities for this project right now.
                    </p>
                    <div className="welcome-actions">
                        <button
                            type="button"
                            className="main-view-welcome-button"
                            onClick={() => {
                                void activitiesQuery.refetch();
                            }}
                        >
                            Try again
                        </button>
                    </div>
                </header>
            </section>
        );
    }

    if (activities.length === 0) {
        return (
            <ActivitiesWelcome 
                projectName={projectName}
                projectId={projectId}
            />
        )
    }

    return (
        <Activities 
            activities={activities}
            corpusName={corpusName}
        />
    );
};

export default ActivitiesView;
