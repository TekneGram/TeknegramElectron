import type { ActivityType } from "@/app/ports/activities.ports";

interface ActivitiesStartTransitionProps {
    activityType: ActivityType | null;
}

function getCopy(activityType: ActivityType | null) {
    if (activityType === "explore_activities") {
        return {
            badge: "Activity Created",
            title: "Exploration activity created.",
            status: "Preparing exploration workspace...",
        };
    }

    return {
        badge: "Activity Created",
        title: "Lexical bundles activity created",
        status: "Prepareing lexical bundles workspace...",
    }
}

const ActivitiesStartTransition: React.FC<ActivitiesStartTransitionProps> = ({
    activityType,
}) => {
    const copy = getCopy(activityType);

    return (
        <section className="main-view-transition main-view-grid-surface">
            <div className="main-view-transition-card">
                <div className="main-view-transition-badge">{copy.badge}</div>
                <div className="main-view-transition-copy">
                    <h1>{copy.title}</h1>
                    <p>Teknegram is preparing the next analysis workspace...</p>
                </div>
                <div className="main-view-transition-progress" aria-hidden="true">
                    <span className="main-view-transition-progress-bar" />
                </div>
                <p className="main-view-transition-status">{copy.status}</p>
            </div>
        </section>
    );
};

export default ActivitiesStartTransition;