import ExploreActivitiesIcon from "./icons/ExploreActivitiesIcon";
import LexicalBundlesActivitiesIcon from "./icons/LexicalBundlesActivitiesIcon";

interface ActivitiesWelcomeProps {
    onStartExploreActivity: () => void;
    onStartLexicalBundlesActivity: () => void;
    projectName: string;
}

const ActivitiesWelcome: React.FC<ActivitiesWelcomeProps> = ({ onStartLexicalBundlesActivity, onStartExploreActivity, projectName }) => {

    return(
        <section className="main-view-activities-empty main-view-grid-surface">
            <div className="main-view-activities-empty-grid">
                <div className="main-view-activities-card">
                    <div className="main-view-activities-copy">
                        <div className="title">
                            <h1>Exploration Activities</h1>
                        </div>
                        <div className="welcome-message">
                            <p>Explore and analyze your corpus in depth with these activities in <strong>{projectName}</strong></p>
                        </div>
                    </div>
                    <div className="logo-area">
                        <div className="main-view-brand-icon-shell main-view-brand-icon-shell-welcome" aria-hidden="true">
                            <div className="main-view-brand-icon-ring" />
                            <div className="main-view-brand-icon-core main-view-brand-icon-core-welcome">
                                <ExploreActivitiesIcon />
                            </div>
                        </div>
                    </div>
                    <div className="welcome-actions">
                        <button
                            type="button"
                            className="main-view-welcome-button"
                            onClick={onStartExploreActivity}
                        >
                            Start Activities
                        </button>
                    </div>
                </div>

                <div className="main-view-activities-card">
                    <div className="main-view-activities-copy">
                        <div className="title">
                            <h1>Lexical Bundles</h1>
                        </div>
                        <div className="welcome-message">
                            <p>Use scientific computing techniques to extract lexical bundles from <strong>{projectName}</strong></p>
                        </div>
                    </div>
                    <div className="logo-area">
                        <div className="main-view-brand-icon-shell main-view-brand-icon-shell-welcome" aria-hidden="true">
                            <div className="main-view-brand-icon-ring" />
                            <div className="main-view-brand-icon-core main-view-brand-icon-core-welcome">
                                <LexicalBundlesActivitiesIcon />
                            </div>
                        </div>
                    </div>
                    <div className="welcome-actions">
                        <button
                            type="button"
                            className="main-view-welcome-button"
                            onClick={() => { void onStartLexicalBundlesActivity(); }}
                        >
                            Start Lexical Bundles
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ActivitiesWelcome;