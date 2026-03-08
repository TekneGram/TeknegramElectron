import { useState } from 'react';
import './folderPicker.css'


interface SemanticsRulesPickerProps {
    onSetSemanticsRulesPath: (value: string) => void;
    onPickSemanticsRules: () => void;
    isPickingSemanticsRules: boolean;
    semanticsRulesPath: string;
}

const SemanticsRulesPicker: React.FC<SemanticsRulesPickerProps> = ({ onSetSemanticsRulesPath, onPickSemanticsRules, isPickingSemanticsRules, semanticsRulesPath }) => {

    const [isDragActive, setIsDragActive] = useState<boolean>(false);

    function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
    }

    function handleDragEnter(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragActive(true);
    }

    function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragActive(false);
    }

    function handleDrop(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragActive(false);

        const files = event.dataTransfer.files;
        if (!files || files.length === 0) {
            return
        }
        const firstItem = files[0]
        const droppedPath = firstItem.path;

        if (!droppedPath) {
            return;
        }

        onSetSemanticsRulesPath(droppedPath);
    }

    return (
        <div className="corpus-folder-picker">
            <div className="corpus-folder-picker-header">
                <div>
                    <label className="create-project-field-label">
                        Semantics Rules File - 
                        <span>What's this?</span>
                    </label>
                    <p className="corpus-folder-picker-caption">
                        Select a TSV semantics rules file or drop one below.
                    </p>
                </div>
            </div>
            <button
                type="button"
                className="corpus-folder-picker-button"
                disabled={isPickingSemanticsRules}
                onClick={onPickSemanticsRules}
            >
                {isPickingSemanticsRules ? "Opening...": "Choose TSV file"}
            </button>
            <div
                className={`corpus-folder-dropzone ${isDragActive ? "is-drag-active" : "" }`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {semanticsRulesPath ? (
                    <div className="corpus-folder-selected">
                        <span className="corpus-folder-selected-label">Selected TSV File</span>
                        <span className="corpus-folder-selected-path">{semanticsRulesPath}</span>
                    </div>
                ) : (
                    <div className="corpus-folder-dropzone-empty">
                        <p>Drop semantics rules file here</p>
                        <p>or use the file picker button above</p>
                    </div>
                )}
            </div>
        </div>
        
        
    );
};

export default SemanticsRulesPicker;