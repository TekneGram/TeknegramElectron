import { useState } from 'react';
import './folderPicker.css'

interface CorpusFolderPickerProps {
    onSetFolderPath: (value: string) => void;
    onPickFolder: () => void;
    isPicking: boolean;
    folderPath: string
}

const CorpusFolderPicker: React.FC<CorpusFolderPickerProps> = ({ onSetFolderPath, onPickFolder, isPicking, folderPath }) => {

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

        onSetFolderPath(droppedPath);
    }

    return (
        <div className="corpus-folder-picker">
            <div className="corpus-folder-picker-header">
                <div>
                    <label className="create-project-field-label">Corpus Folder</label>
                    <p className="corpus-folder-picker-caption">
                        Select a folder or drop one into the area below
                    </p>
                </div>
            </div>
            <button
                type="button"
                className="corpus-folder-picker-button"
                disabled={isPicking}
                onClick={onPickFolder}
            >
                {isPicking ? "Opening...": "Choose Folder"}
            </button>
            <div
                className={`corpus-folder-dropzone ${isDragActive ? "is-drag-active" : "" }`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {folderPath ? (
                    <div className="corpus-folder-selected">
                        <span className="corpus-folder-selected-label">Selected folder</span>
                        <span className="corpus-folder-selected-path">{folderPath}</span>
                    </div>
                ) : (
                    <div className="corpus-folder-dropzone-empty">
                        <p>Drop corpus folder here</p>
                        <p>or use the folder picker button above</p>
                    </div>
                )}
            </div>
        </div>
        
        
    );
};

export default CorpusFolderPicker;