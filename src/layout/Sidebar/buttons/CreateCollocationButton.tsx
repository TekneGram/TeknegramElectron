import CreateCollocationActivityIcon from "../icons/CreateCollocationActivityIcon";

interface CreateCollocationButtonProps {
    onClickCreate: () => void;
}

const CreateCollocationButton: React.FC<CreateCollocationButtonProps> = ({ onClickCreate }) => {
    return (
        <button className="sidebar-create-project-button tooltip-anchor" aria-label="Collocation Analysis" onClick={onClickCreate}>
            <CreateCollocationActivityIcon />
            <span className="sidebar-tooltip tooltip-panel tooltip-panel-right-center tooltip-panel-pill tooltip-panel-delayed">Collocation Analysis</span>
        </button>
    );
};

export default CreateCollocationButton;
