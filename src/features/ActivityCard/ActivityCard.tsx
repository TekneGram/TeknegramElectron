import { ActivityParentContext, ActivityDetails } from "@/app/ports/activities.ports";
import "./ActivityCard.css";
import "@/styles/button-styles.css";
import "@/styles/badge-style.css";
import { useNavigation } from "@/app/providers/useNavigation";

type ActivityCardProps = {
    activityParentContext: ActivityParentContext;
    activityDetails: ActivityDetails;
};

const ActivityCard: React.FC<ActivityCardProps> = ({
    activityParentContext,
    activityDetails
}) => {

    const { dispatch } = useNavigation();

    const enterAnalysisWorkspace = () => {
        dispatch({
            type: "open-analysis",
            activityDetails: activityDetails,
            activityParentContext: activityParentContext
        })
    }

    return (
        <article className="activity-card-shell">
            <div className="activity-card">
                <div className="activity-card-header">
                    <div className="badge-pill badge-pill-primary badge-pill-sm">{activityDetails.activityTypeDisplayName}</div>
                    <h3 className="activity-card-title">{activityDetails.activityName}</h3>
                </div>
                <p className="activity-card-description">{activityDetails.description}</p>
                <button
                    onClick={enterAnalysisWorkspace}
                    className="button-primary button-size-lg"
                >Enter</button>
            </div>
        </article>
    );
};

export default ActivityCard;
