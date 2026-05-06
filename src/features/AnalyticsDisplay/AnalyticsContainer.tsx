import { ActivityDetails, ActivityParentContext } from "@/app/ports/activities.ports";


type AnalyticsContainerProps = {
    activityDetails: ActivityDetails;
    activityParentContext: ActivityParentContext;
};

const AnalyticsContainer = ({ activityDetails, activityParentContext }: AnalyticsContainerProps) => {

    return(
        <section className="analytics-display-container">
            {activityDetails.activityName} and {activityParentContext.corpusName}
        </section>
    );
};

export default AnalyticsContainer;