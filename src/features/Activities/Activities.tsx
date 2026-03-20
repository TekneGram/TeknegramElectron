import { ActivityDetails } from "@/app/ports/activities.ports"
import ActivityCard from "@/features/ActivityCard/ActivityCard";

interface ActivitiesProps {
    activities: ActivityDetails[];
    corpusName: string;
}

const Activities: React.FC<ActivitiesProps> = ({ activities, corpusName }) => {

    return (
        <section className="activities-screen main-view-grid-surface">
            <header className="activities-screen-header">
                <p className="activities-screen-eyebrow">Corpus Activities</p>
                <h1>{corpusName}</h1>
                <p className="activities-screen-intro">
                    {activities.length} {activities.length === 1 ? "activity is" : "activities are"} set up for this corpus.
                </p>
            </header>
            <div className="activities-grid">
                {activities.map((activity) => (
                    <ActivityCard
                        key={activity.activityId}
                        activityName={activity.activityName}
                        activityTypeDisplayName={activity.activityTypeDisplayName}
                        description={activity.description}
                    />
                ))}
            </div>
        </section>
    );
};

export default Activities;