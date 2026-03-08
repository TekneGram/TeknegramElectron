import { useState } from 'react';
import './semanticsRulesPicker.css';


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
        <div className="semantics-rules-picker">
            <div className="semantics-rules-picker-header">
                <div>
                    <div className="semantics-rules-picker-label-row">
                        <label className="create-project-field-label">
                            Semantics Rules File (Optional)
                        </label>
                        <div className="semantics-rules-tooltip">
                            <span
                                className="semantics-rules-tooltip-trigger"
                                tabIndex={0}
                            >
                                What is this?
                            </span>
                            <div className="semantics-rules-tooltip-content">
                                <p>
                                    Optionally add a TSV (tab separated values) file that gives semantics to your corpus folder structure.
                                </p>
                                <div className="semantics-rules-tooltip-tree" aria-hidden="true">
                                    <div className="semantics-rules-tree-row semantics-rules-tree-root">
                                        <span className="semantics-rules-tree-caret">⌄</span>
                                        <span className="semantics-rules-folder-icon" />
                                        <span>Corpus</span>
                                    </div>
                                    <div className="semantics-rules-tree-branch">
                                        <div className="semantics-rules-tree-row semantics-rules-tree-level-1">
                                            <span className="semantics-rules-tree-caret">⌄</span>
                                            <span className="semantics-rules-folder-icon" />
                                            <span>CEFR A1</span>
                                        </div>
                                        <div className="semantics-rules-tree-branch">
                                            <div className="semantics-rules-tree-row semantics-rules-tree-level-2">
                                                <span className="semantics-rules-tree-caret semantics-rules-tree-caret-placeholder" />
                                                <span className="semantics-rules-folder-icon" />
                                                <span>French</span>
                                            </div>
                                            <div className="semantics-rules-tree-row semantics-rules-tree-level-2">
                                                <span className="semantics-rules-tree-caret semantics-rules-tree-caret-placeholder" />
                                                <span className="semantics-rules-folder-icon" />
                                                <span>Spanish</span>
                                            </div>
                                        </div>
                                        <div className="semantics-rules-tree-row semantics-rules-tree-level-1">
                                            <span className="semantics-rules-tree-caret">⌄</span>
                                            <span className="semantics-rules-folder-icon" />
                                            <span>CEFR A2</span>
                                        </div>
                                        <div className="semantics-rules-tree-branch">
                                            <div className="semantics-rules-tree-row semantics-rules-tree-level-2">
                                                <span className="semantics-rules-tree-caret semantics-rules-tree-caret-placeholder" />
                                                <span className="semantics-rules-folder-icon" />
                                                <span>French</span>
                                            </div>
                                            <div className="semantics-rules-tree-row semantics-rules-tree-level-2">
                                                <span className="semantics-rules-tree-caret semantics-rules-tree-caret-placeholder" />
                                                <span className="semantics-rules-folder-icon" />
                                                <span>Spanish</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p>
                                    Your TSV file might look like this:
                                </p>
                                <pre className="semantics-rules-tooltip-code">
                                    {`Level\tdepth\t0
                                    First_Language\tdepth\t1`}
                                </pre>
                                <p>
                                    Later you will be able to search your corpus by level or by first language.
                                </p>
                            </div>
                        </div>
                    </div>
                    <p className="semantics-rules-picker-caption">
                        Select a TSV semantics rules file or drop one below.
                    </p>
                </div>
            </div>
            <button
                type="button"
                className="semantics-rules-picker-button"
                disabled={isPickingSemanticsRules}
                onClick={onPickSemanticsRules}
            >
                {isPickingSemanticsRules ? "Opening...": "Choose TSV file"}
            </button>
            <div
                className={`semantics-rules-dropzone ${isDragActive ? "is-drag-active" : "" }`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {semanticsRulesPath ? (
                    <div className="semantics-rules-selected">
                        <span className="semantics-rules-selected-label">Selected TSV File</span>
                        <span className="semantics-rules-selected-path">{semanticsRulesPath}</span>
                    </div>
                ) : (
                    <div className="semantics-rules-dropzone-empty">
                        <p>Drop semantics rules file here</p>
                        <p>or use the file picker button above</p>
                    </div>
                )}
            </div>
        </div>
        
        
    );
};

export default SemanticsRulesPicker;
