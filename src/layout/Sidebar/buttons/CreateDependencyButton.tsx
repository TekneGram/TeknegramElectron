import CreateDependencyActivityIcon from "../icons/CreateDependencyActivityIcon";

interface CreateDependencyButtonProps {
    onClickCreate: () => void;
}

const CreateDependencyButton: React.FC<CreateDependencyButtonProps> = ({ onClickCreate }) => {
    return (
        <button className="sidebar-create-project-button tooltip-anchor" aria-label="Dependency Analysis" onClick={onClickCreate}>
            <CreateDependencyActivityIcon />
            <span className="sidebar-tooltip tooltip-panel tooltip-panel-right-center tooltip-panel-pill tooltip-panel-delayed">Dependency Analysis</span>
        </button>
    );
};

export default CreateDependencyButton;
