import { useState } from "react";
import { useNavigation } from "@/app/providers/useNavigation";
import AnalyticsPanel from "@/features/AnalysisViews/AnalyticsPanel";
import AnalysisDisplay from "@/features/AnalysisViews/AnalysisDisplay";
import Bubbly from "@/features/Bubbly/Bubbly";
import type { AnalysisType } from "@/app/ports/analysis.ports";
import type { AnalysisFormType } from "@/features/AnalysisViews/types/analysisFormType";
import type { BubbleBlower } from "@/features/Bubbly/types/bubble";
import { mapAnalysisTypeToLayerType } from "@/features/Bubbly/mappers/bubbleWrap.mappers";
import "./styles/AnalysisView.css";

const AnalyticsScreen = () => {
    const { navigationState } = useNavigation();
    const [analysisFormType, setAnalysisFormType] = useState<AnalysisFormType | null>(null);
    const [showAnalysisDisplay, setShowAnalysisDisplay] = useState<boolean>(false);
    const [pendingBlowBubbleRequest, setPendingBlowBubbleRequest] = useState<BubbleBlower | null>(null);

    const isAnalysis = navigationState.kind === "analysis";
    if (!isAnalysis) {
        return null;
    }

    const handleDisplayForm = (formType: AnalysisFormType) => {
        setShowAnalysisDisplay(true);
        setAnalysisFormType(formType);
    };

    const handleStopShowingDisplay = () => {
        setShowAnalysisDisplay(false);
        setAnalysisFormType(null);
    };

    const passAnalysisRequestToBubbly = (analysisType: AnalysisType, config: string | null) => {
        setPendingBlowBubbleRequest({
            parentContextId: navigationState.activityParentContext.corpusId,
            activityId: navigationState.activityDetails.activityId,
            bubbleLayerType: mapAnalysisTypeToLayerType(analysisType),
            config,
        });
        setShowAnalysisDisplay(false);
        setAnalysisFormType(null);
    };

    return (
        <section className="analysis-workspace main-view-grid-surface" aria-label="Analysis workspace">
            <AnalyticsPanel onDisplayForm={handleDisplayForm} />
            <section className="display-area">
                {
                    showAnalysisDisplay && analysisFormType
                        ? <AnalysisDisplay
                            analysisFormType={analysisFormType}
                            onStopShowing={handleStopShowingDisplay}
                            onAnalysisRequest={passAnalysisRequestToBubbly}
                        />
                        : <Bubbly
                            parentContextId={navigationState.activityParentContext.corpusId}
                            activityId={navigationState.activityDetails.activityId}
                            activityName={navigationState.activityDetails.activityName}
                            title={navigationState.activityParentContext.corpusName}
                            pendingBlowBubbleRequest={pendingBlowBubbleRequest}
                            onBlowBubbleRequestHandled={() => setPendingBlowBubbleRequest(null)}
                        />
                }
            </section>
        </section>
    );
};

export default AnalyticsScreen;
