import { pickSemanticsRulesFile } from '../services/pickSemanticsRulesFile.service';
import { systemAdapter } from '@/app/adapters/system.adapters';
import { useState } from 'react';

const usePickSemanticsRulesFile = () => {

    const [isPickingSemanticsRules, setIsPickingSemanticsRules] = useState<boolean>(false);
    
    async function pickSemanticsRules(): Promise<string | null> {
        const result =  await pickSemanticsRulesFile(systemAdapter);
        return result.filePath;
    }

    return {
        pickSemanticsRules, isPickingSemanticsRules, setIsPickingSemanticsRules
    }
};

export default usePickSemanticsRulesFile;