import CreateLBActivityIcon from "../icons/CreateLBActivityIcon";

interface CreateLBButtonProps {
    onClickCreate: () => void;
}

const CreateLBButton: React.FC<CreateLBButtonProps> = ({ onClickCreate }) => {
    
    return(
        <button className="sidebar-create-project-button tooltip-anchor" aria-label="Lexical Bundles Analysis" onClick={onClickCreate}>
            <CreateLBActivityIcon />
            <span className="sidebar-tooltip tooltip-panel tooltip-panel-right-center tooltip-panel-pill tooltip-panel-delayed">Lexical Bundles Analysis</span>
        </button>
    );
};

export default CreateLBButton;
