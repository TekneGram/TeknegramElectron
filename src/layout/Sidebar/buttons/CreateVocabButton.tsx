import CreateVocabActivityIcon from "../icons/CreateVocabActivityIcon";

interface CreateVocabButtonProps {
    onClickCreate: () => void;
}

const CreateVocabButton: React.FC<CreateVocabButtonProps> = ({ onClickCreate }) => {
    return (
        <button className="sidebar-create-project-button tooltip-anchor" aria-label="Vocabulary Analysis" onClick={onClickCreate}>
            <CreateVocabActivityIcon />
            <span className="sidebar-tooltip tooltip-panel tooltip-panel-right-center tooltip-panel-pill tooltip-panel-delayed">Vocabulary Analysis</span>
        </button>
    );
};

export default CreateVocabButton;
