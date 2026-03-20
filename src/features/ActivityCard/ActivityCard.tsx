import "./ActivityCard.css";

type ActivityCardProps = {
    activityName: string;
    activityTypeDisplayName: string;
    description: string;
};

const ActivityCard: React.FC<ActivityCardProps> = ({
    activityName,
    activityTypeDisplayName,
    description,
}) => {
    return (
        <article className="activity-card-shell">
            <div className="activity-card">
                <div className="activity-card-header">
                    <div className="activity-card-badge">{activityTypeDisplayName}</div>
                    <h3 className="activity-card-title">{activityName}</h3>
                </div>
                <p className="activity-card-description">{description}</p>
            </div>
        </article>
    );
};

export default ActivityCard;
