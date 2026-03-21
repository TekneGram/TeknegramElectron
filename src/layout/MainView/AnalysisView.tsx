import AnalyticsPanel from "@/features/AnalysisViews/AnalyticsPanel";
import AnalysisDisplay from "@/features/AnalysisViews/AnalysisDisplay";
import Bubbly from "@/features/Bubbly/Bubbly";
import { useNavigation } from "@/app/providers/useNavigation";


const AnalysisView = () => {
    const { navigationState } = useNavigation();

    const isAnalysis = navigationState.kind === "analysis";
    if (!isAnalysis) {
        return null;
    }
    const aStateOfSorts = true; // A state will determine whether the Bubbly or the AnalysisDisplay is shown

    return (
        <section className="main-view-grid-surface" style={{ minHeight: "100vh" }} aria-label="Analysis workspace">
            <AnalyticsPanel />
            <section className="display-area">
                {
                    aStateOfSorts ? <AnalysisDisplay /> : <Bubbly activityId={navigationState.activityType}/>
                }
            </section>
            
        </section>
    );
};

export default AnalysisView;
