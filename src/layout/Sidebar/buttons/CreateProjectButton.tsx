import CreateProjectIcon from "../icons/CreateProjectIcon";

interface CreateProjectButtonProps {
    onClickCreate: () => void;
}

const CreateProjectButton: React.FC<CreateProjectButtonProps> = ({ onClickCreate }) => {
    
    return(
        <button className="sidebar-create-project-button tooltip-anchor" aria-label="New Project" onClick={onClickCreate}>
            <CreateProjectIcon />
            <span className="sidebar-tooltip tooltip-panel tooltip-panel-right-center tooltip-panel-pill tooltip-panel-delayed">New Project</span>
        </button>
    );
};

export default CreateProjectButton;
