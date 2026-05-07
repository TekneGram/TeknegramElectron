import { ActivityDetails, ActivityParentContext } from "@/app/ports/activities.ports";


type AnalyticsDisplayProps = {
    activityDetails: ActivityDetails;
    activityParentContext: ActivityParentContext;
};

const AnalyticsDisplay = ({ activityDetails, activityParentContext }: AnalyticsDisplayProps) => {

    return(
        <section className="analytics-display-container">
            {activityDetails.activityName} and {activityParentContext.corpusName}
        </section>
    );
};

export default AnalyticsDisplay;