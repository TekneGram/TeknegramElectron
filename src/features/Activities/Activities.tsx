import { ActivityDetails } from "@/app/ports/activities.ports"
import ActivityCard from "@/features/ActivityCard/ActivityCard";
import type { ActivityParentContext } from "@/app/ports/activities.ports";
import "@/styles/text-style.css";

interface ActivitiesProps {
    activities: ActivityDetails[];
    activityParentContext: ActivityParentContext;
}

const Activities: React.FC<ActivitiesProps> = ({ activities, activityParentContext }) => {

    return (
        <section className="activities-screen main-view-grid-surface">
            <header className="activities-screen-header">
                <p className="eyebrow-text eyebrow-text-md">Corpus Activities</p>
                <h1>{activityParentContext.corpusName}</h1>
                <p className="activities-screen-intro">
                    {activities.length} {activities.length === 1 ? "activity is" : "activities are"} set up for this corpus.
                </p>
            </header>
            <div className="activities-grid">
                {activities.map((activity) => (
                    <ActivityCard
                        key={activity.activityId}
                        activityDetails={activity}
                        activityParentContext={activityParentContext}
                    />
                ))}
            </div>
        </section>
    );
};

export default Activities;
