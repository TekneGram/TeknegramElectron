import CreateProjectIcon from "./CreateProjectIcon";

interface CreateProjectButtonProps {
    onClickCreate: () => void;
}

const CreateProjectButton: React.FC<CreateProjectButtonProps> = ({ onClickCreate }) => {
    
    return(
        <button className="sidebar-create-project-button" aria-label="New Project" onClick={onClickCreate}>
            <CreateProjectIcon />
            <span className="sidebar-tooltip">New Project</span>
        </button>
    );
};

export default CreateProjectButton;