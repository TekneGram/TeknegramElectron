import { pickCorpusFolder } from "../services/pickCorpusFolder.service";
import { systemAdapter } from '@/app/adapters/system.adapters';
import { useState } from 'react';

const usePickCorpusFolder = () => {

    const [isPicking, setIsPicking] = useState<boolean>(false);
    
    async function pickFolder(): Promise<string | null> {
        const result =  await pickCorpusFolder(systemAdapter);
        return result.folderPath;
    }

    return {
        pickFolder, isPicking, setIsPicking
    }
};

export default usePickCorpusFolder;