import AnalyticsPanel from "@/features/AnalysisViews/AnalyticsPanel";
import AnalysisDisplay from "@/features/AnalysisViews/AnalysisDisplay";
import Bubbly from "@/features/Bubbly/Bubbly";

const AnalysisView = () => {

    const aStateOfSorts = true; // A state will determine whether the Bubbly or the AnalysisDisplay is shown

    return (
        <section className="main-view-grid-surface" style={{ minHeight: "100vh" }} aria-label="Analysis workspace">
            <AnalyticsPanel />
            <section className="display-area">
                {
                    aStateOfSorts ? <AnalysisDisplay /> : <Bubbly />
                }
            </section>
            
        </section>
    );
};

export default AnalysisView;
