import CreateExploreActivityIcon from "../icons/CreateExploreActivityIcon";

interface CreateExploreActivityButtonProps {
    onClickCreate: () => void;
}

const CreateExploreActivityButton: React.FC<CreateExploreActivityButtonProps> = ({ onClickCreate }) => {
    
    return(
        <button className="sidebar-create-project-button" aria-label="Explore your corpus" onClick={onClickCreate}>
            <CreateExploreActivityIcon />
            <span className="sidebar-tooltip">Explore your corpus</span>
        </button>
    );
};

export default CreateExploreActivityButton;