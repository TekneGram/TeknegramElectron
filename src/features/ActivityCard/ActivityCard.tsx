import { ActivityType } from "@/app/ports/activities.ports";
import "./ActivityCard.css";
import "@/styles/button-styles.css";
import "@/styles/badge-style.css";
import { useNavigation } from "@/app/providers/useNavigation";

type ActivityCardProps = {
    projectId: string;
    activityName: string;
    activityId: string;
    activityType: ActivityType;
    activityTypeDisplayName: string;
    description: string;
};

const ActivityCard: React.FC<ActivityCardProps> = ({
    projectId,
    activityName,
    activityId,
    activityType,
    activityTypeDisplayName,
    description,
}) => {

    const { dispatch } = useNavigation();

    const enterAnalysisWorkspace = () => {
        dispatch({
            type: "open-analysis",
            projectId: projectId,
            activityId: activityId,
            activityType: activityType
        })
    }

    return (
        <article className="activity-card-shell">
            <div className="activity-card">
                <div className="activity-card-header">
                    <div className="badge-pill badge-pill-primary badge-pill-sm">{activityTypeDisplayName}</div>
                    <h3 className="activity-card-title">{activityName}</h3>
                </div>
                <p className="activity-card-description">{description}</p>
                <button
                    onClick={enterAnalysisWorkspace}
                    className="button-primary button-size-lg"
                >Enter</button>
            </div>
        </article>
    );
};

export default ActivityCard;
