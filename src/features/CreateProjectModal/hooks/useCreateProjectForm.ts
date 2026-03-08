import { useState } from 'react';

const useCreateProjectForm = () => {

    const [projectName, setProjectName] = useState<string>("");
    const [corpusName, setCorpusName] = useState<string>("");
    const [folderPath, setFolderPath] = useState<string>("");
    const [semanticsRulesPath, setSemanticsRulesPath] = useState<string>("");

    const resetForm = () => {
        setProjectName("");
        setCorpusName("");
        setFolderPath("");
        setSemanticsRulesPath("");
    }

    return {
        values: {
            projectName,
            corpusName,
            folderPath,
            semanticsRulesPath,
        },
        setters: {
            setProjectName,
            setCorpusName,
            setFolderPath,
            setSemanticsRulesPath,
        },
        resetForm,
    };
};

export default useCreateProjectForm;