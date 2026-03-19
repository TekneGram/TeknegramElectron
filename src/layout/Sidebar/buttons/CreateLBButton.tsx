import CreateLBActivityIcon from "../icons/CreateLBActivityIcon";

interface CreateLBButtonProps {
    onClickCreate: () => void;
}

const CreateLBButton: React.FC<CreateLBButtonProps> = ({ onClickCreate }) => {
    
    return(
        <button className="sidebar-create-project-button" aria-label="Lexical Bundles Analysis" onClick={onClickCreate}>
            <CreateLBActivityIcon />
            <span className="sidebar-tooltip">Lexical Bundles Analysis</span>
        </button>
    );
};

export default CreateLBButton;