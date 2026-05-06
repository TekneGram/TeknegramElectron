import type { ActivityType } from "@/app/ports/activities.ports";
import "@/styles/badge-style.css";

interface ActivitiesStartTransitionProps {
    activityType: ActivityType | null;
}

function getCopy(activityType: ActivityType | null) {
    if (activityType === "vocab_activities") {
        return {
            badge: "Activity Created",
            title: "Vocabulary activity created.",
            status: "Preparing vocabulary workspace...",
        };
    }

    if (activityType === "lb_activities") {
        return {
            badge: "Activity Created",
            title: "Lexical bundles activity created.",
            status: "Preparing lexical bundles workspace...",
        };
    }

    if (activityType === "collocation_activities") {
        return {
            badge: "Activity Created",
            title: "Collocation activity created.",
            status: "Preparing collocation workspace...",
        };
    }

    if (activityType === "dependency_activities") {
        return {
            badge: "Activity Created",
            title: "Dependency activity created.",
            status: "Preparing dependency workspace...",
        };
    }

    return {
        badge: "Activity Created",
        title: "Activity created.",
        status: "Preparing activity workspace...",
    }
}

const ActivitiesStartTransition: React.FC<ActivitiesStartTransitionProps> = ({
    activityType,
}) => {
    const copy = getCopy(activityType);

    return (
        <section className="main-view-transition main-view-grid-surface">
            <div className="main-view-transition-card">
                <div className="badge-pill badge-pill-primary badge-pill-md">{copy.badge}</div>
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
