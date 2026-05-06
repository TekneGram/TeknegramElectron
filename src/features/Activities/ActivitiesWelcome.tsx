import LexicalBundlesActivitiesIcon from "./icons/LexicalBundlesActivitiesIcon";
import VocabActivitiesIcon from "./icons/VocabActivitiesIcon";
import CollocationActivitiesIcon from "./icons/CollocationActivitiesIcon";
import DependencyActivitiesIcon from "./icons/DependencyActivitiesIcon";
import "@/styles/button-styles.css";
import { useActivityStart } from "@/app/providers/useActivityStart";

interface ActivitiesWelcomeProps {
    projectName: string;
    projectId: string;
}

const ActivitiesWelcome: React.FC<ActivitiesWelcomeProps> = ({ projectName, projectId }) => {

    const { openStartModal } = useActivityStart();

    return(
        <section className="main-view-activities-empty main-view-grid-surface">
            <div className="main-view-activities-empty-grid">
                <div className="main-view-activities-card">
                    <div className="main-view-activities-copy">
                        <div className="title">
                            <h1>Vocabulary Activities</h1>
                        </div>
                        <div className="welcome-message">
                            <p>Explore vocabulary distribution and lexical patterns in <strong>{projectName}</strong></p>
                        </div>
                    </div>
                    <div className="logo-area">
                        <div className="main-view-brand-icon-shell main-view-brand-icon-shell-welcome" aria-hidden="true">
                            <div className="main-view-brand-icon-ring" />
                            <div className="main-view-brand-icon-core main-view-brand-icon-core-welcome">
                                <VocabActivitiesIcon />
                            </div>
                        </div>
                    </div>
                    <div className="welcome-actions">
                        <button
                            type="button"
                            className="button-primary button-size-xl"
                            onClick={() => openStartModal({
                                projectId,
                                projectName,
                                activityType: "vocab_activities",
                            })}
                        >
                            Create Vocabulary
                        </button>
                    </div>
                </div>

                <div className="main-view-activities-card">
                    <div className="main-view-activities-copy">
                        <div className="title">
                            <h1>Collocation Activities</h1>
                        </div>
                        <div className="welcome-message">
                            <p>Track recurring word partnerships and collocational strength in <strong>{projectName}</strong></p>
                        </div>
                    </div>
                    <div className="logo-area">
                        <div className="main-view-brand-icon-shell main-view-brand-icon-shell-welcome" aria-hidden="true">
                            <div className="main-view-brand-icon-ring" />
                            <div className="main-view-brand-icon-core main-view-brand-icon-core-welcome">
                                <CollocationActivitiesIcon />
                            </div>
                        </div>
                    </div>
                    <div className="welcome-actions">
                        <button
                            type="button"
                            className="button-primary button-size-xl"
                            onClick={() => openStartModal({
                                projectId,
                                projectName,
                                activityType: "collocation_activities",
                            })}
                        >
                            Create Collocation
                        </button>
                    </div>
                </div>

                <div className="main-view-activities-card">
                    <div className="main-view-activities-copy">
                        <div className="title">
                            <h1>Dependency Activities</h1>
                        </div>
                        <div className="welcome-message">
                            <p>Analyze syntactic dependency structures across texts in <strong>{projectName}</strong></p>
                        </div>
                    </div>
                    <div className="logo-area">
                        <div className="main-view-brand-icon-shell main-view-brand-icon-shell-welcome" aria-hidden="true">
                            <div className="main-view-brand-icon-ring" />
                            <div className="main-view-brand-icon-core main-view-brand-icon-core-welcome">
                                <DependencyActivitiesIcon />
                            </div>
                        </div>
                    </div>
                    <div className="welcome-actions">
                        <button
                            type="button"
                            className="button-primary button-size-xl"
                            onClick={() => openStartModal({
                                projectId,
                                projectName,
                                activityType: "dependency_activities",
                            })}
                        >
                            Create Dependency
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
                            className="button-primary button-size-xl"
                            onClick={() => openStartModal({
                                projectId,
                                projectName,
                                activityType: "lb_activities",
                            })}
                        >
                            Create Lexical Bundles
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ActivitiesWelcome;
