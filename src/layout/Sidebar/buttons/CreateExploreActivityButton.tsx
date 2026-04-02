import CreateExploreActivityIcon from "../icons/CreateExploreActivityIcon";

interface CreateExploreActivityButtonProps {
    onClickCreate: () => void;
}

const CreateExploreActivityButton: React.FC<CreateExploreActivityButtonProps> = ({ onClickCreate }) => {
    
    return(
        <button className="sidebar-create-project-button tooltip-anchor" aria-label="Explore your corpus" onClick={onClickCreate}>
            <CreateExploreActivityIcon />
            <span className="sidebar-tooltip tooltip-panel tooltip-panel-right-center tooltip-panel-pill tooltip-panel-delayed">Explore your corpus</span>
        </button>
    );
};

export default CreateExploreActivityButton;
