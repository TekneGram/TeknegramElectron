import { useNavigation } from "@/app/providers/useNavigation";
import "./styles/AnalysisView.css";
import AnalyticsContainer from "@/features/AnalyticsDisplay/AnalyticsContainer";

const AnalyticsScreen = () => {
    const { navigationState } = useNavigation();

    const isAnalysis = navigationState.kind === "analysis";
    if (!isAnalysis) {
        return null;
    }

    return (
        <section className="analysis-workspace main-view-grid-surface" aria-label="Analysis workspace">
            <section className="display-area">
                <section className="analysis-display">
                    <h2>Analytics</h2>
                    <p>
                        Activity: <strong>{navigationState.activityDetails.activityName}</strong>
                    </p>
                    <p>
                        Corpus: <strong>{navigationState.activityParentContext.corpusName}</strong>
                    </p>
                    <AnalyticsContainer
                        activityDetails={navigationState.activityDetails}
                        activityParentContext={navigationState.activityParentContext}
                    />
                </section>
            </section>
        </section>
    );
};

export default AnalyticsScreen;
