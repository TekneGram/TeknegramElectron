import "./styles/analyticsPanel.css";
import type { AnalysisFormType } from "./types/analysisFormType";

interface AnalyticsPanelProps {
    onDisplayForm: (formType: AnalysisFormType) => void
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ onDisplayForm }) => {

    const handleDisplayForm = (formType: AnalysisFormType) => {
        onDisplayForm(formType);
    }

    return (
        <section className="analysis-panel">
            <button 
                className="analysis-panel-button" 
                type="button" 
                aria-label="Inspect corpus metadata"
                onClick={() => handleDisplayForm("Inspect")}
            >
                I
            </button>
            <button 
                className="analysis-panel-button" 
                type="button" 
                aria-label="Sample the corpus documents"
                onClick={() => handleDisplayForm("Sampler")}
            >
                S
            </button>
            <button 
                className="analysis-panel-button" 
                type="button" 
                aria-label="Run a full experiment"
                onClick={() => handleDisplayForm("Run")}
            >
                R
            </button>
        </section>
    );
};

export default AnalyticsPanel;
