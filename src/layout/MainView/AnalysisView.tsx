import { useState } from "react";

import AnalyticsPanel from "@/features/AnalysisViews/AnalyticsPanel";
import AnalysisDisplay from "@/features/AnalysisViews/AnalysisDisplay";
import Bubbly from "@/features/Bubbly/Bubbly";
import { useNavigation } from "@/app/providers/useNavigation";

import type { AnalysisCorpusMetadataResponse } from "@/app/ports/analysis.ports";
import type { ActivityDetails, ActivityParentContext } from "@/app/ports/activities.ports";

import "./styles/AnalysisView.css";


export type AnalysisFormType =
    | "Inspect"
    | "Sampler"
    | "Run";

const AnalysisView = () => {
    const { navigationState } = useNavigation();

    const [analysisFormType, setAnalysisFormType] = useState<AnalysisFormType | null>(null);
    const [showAnalysisDisplay, setShowAnalysisDisplay] = useState<boolean>(false);
    const [analysisData, setAnalysisData] = useState<AnalysisCorpusMetadataResponse | null>(null);

    const isAnalysis = navigationState.kind === "analysis";
    if (!isAnalysis) {
        return null;
    }

    const handleDisplayForm = (formType: AnalysisFormType) => {
        setShowAnalysisDisplay(true);
        setAnalysisFormType(formType);
    }

    const handleStopShowingDisplay = () => {
        setShowAnalysisDisplay(false);
        setAnalysisFormType(null);
    }

    const handleAnalysisCreated = (result: AnalysisCorpusMetadataResponse) => {
        setAnalysisData(result);
        setShowAnalysisDisplay(false);
        setAnalysisFormType(null);
    }

    return (
        <section className="analysis-workspace main-view-grid-surface" aria-label="Analysis workspace">
            <AnalyticsPanel onDisplayForm={handleDisplayForm} />
            <section className="display-area">
                {
                    showAnalysisDisplay && analysisFormType 
                        ? <AnalysisDisplay 
                                analysisFormType={analysisFormType}
                                activityParentContext={navigationState.activityParentContext}
                                activityDetails={navigationState.activityDetails}
                                onStopShowing={handleStopShowingDisplay}
                                onAnalysisCreated={handleAnalysisCreated}
                            /> 
                        : <Bubbly 
                                parentContextId={navigationState.activityParentContext.corpusId}
                                activityId={navigationState.activityDetails.activityId} 
                                activityName={navigationState.activityDetails.activityName} 
                                title={navigationState.activityParentContext.corpusName}
                                initialData={analysisData}
                            />
                }
            </section>
        </section>
    );
};

export default AnalysisView;
