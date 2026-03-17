import { useState } from 'react';

const useCreateProjectForm = () => {

    const [projectName, setProjectName] = useState<string>("");
    const [corpusName, setCorpusName] = useState<string>("");
    const [folderPath, setFolderPath] = useState<string>("");
    const [semanticsRulesPath, setSemanticsRulesPath] = useState<string>("");
    const [compress, setCompress] = useState<boolean>(false);
    const [emitNgramPositions, setEmitNgramPositions] = useState<boolean>(true);

    const resetForm = () => {
        setProjectName("");
        setCorpusName("");
        setFolderPath("");
        setSemanticsRulesPath("");
        setCompress(false);
        setEmitNgramPositions(true);
    }

    const trimmedProjectName = projectName.trim();
    const trimmedCorpusName = corpusName.trim();
    const trimmedFolderPath = folderPath.trim();
    const trimmedSemanticsRulesPath = semanticsRulesPath.trim();

    const errors = {
        projectName: trimmedProjectName ? "" : "Project name is required.",
        corpusName: trimmedCorpusName ? "" : "Corpus name is required",
        folderPath: trimmedFolderPath ? "": "Corpus folder is required",
        semanticsRulesPath: trimmedSemanticsRulesPath && !trimmedSemanticsRulesPath.toLowerCase().endsWith(".tsv")
            ? "Semantic rules file must be a TSV file."
            : ""
    };

    const canSubmit = 
        !errors.projectName &&
        !errors.corpusName &&
        !errors.folderPath &&
        !errors.semanticsRulesPath; 

    return {
        values: {
            projectName,
            corpusName,
            folderPath,
            semanticsRulesPath,
            compress,
            emitNgramPositions,
        },
        setters: {
            setProjectName,
            setCorpusName,
            setFolderPath,
            setSemanticsRulesPath,
            setCompress,
            setEmitNgramPositions,
        },
        errors,
        canSubmit,
        resetForm,
    };
};

export default useCreateProjectForm;
