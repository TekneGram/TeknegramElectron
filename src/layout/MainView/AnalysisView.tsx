import AnalyticsPanel from "@/features/AnalysisViews/AnalyticsPanel";
import AnalysisDisplay from "@/features/AnalysisViews/AnalysisDisplay";
import Bubbly from "@/features/Bubbly/Bubbly";
import { useNavigation } from "@/app/providers/useNavigation";
import "./styles/AnalysisView.css";
import { useState } from "react";

export type AnalysisFormType =
    | "Inspect"
    | "Sampler"
    | "Run";

const AnalysisView = () => {
    const { navigationState } = useNavigation();
    const [analysisFormType, setAnalysisFormType] = useState<AnalysisFormType | null>(null);
    const [showAnalysisDisplay, setShowAnalysisDisplay] = useState<boolean>(false);

    const isAnalysis = navigationState.kind === "analysis";
    if (!isAnalysis) {
        return null;
    }

    const handleDisplayForm = (formType: AnalysisFormType) => {
        setShowAnalysisDisplay(true);
        setAnalysisFormType(formType);
    }

    const handleDisplayBubbly = () => {
        setShowAnalysisDisplay(false);
        setAnalysisFormType(null);
    }

    return (
        <section className="analysis-workspace main-view-grid-surface" aria-label="Analysis workspace">
            <AnalyticsPanel onDisplayForm={handleDisplayForm} />
            <section className="display-area">
                {
                    showAnalysisDisplay && analysisFormType 
                        ? <AnalysisDisplay analysisFormType={analysisFormType} onStopShowing={handleDisplayBubbly}/> 
                        : <Bubbly 
                            activityId={navigationState.activityId} 
                            activityName={navigationState.activityName} 
                            title={navigationState.corpusName}
                            />
                }
            </section>
        </section>
    );
};

export default AnalysisView;
