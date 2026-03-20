import ExploreActivitiesIcon from "./icons/ExploreActivitiesIcon";
import LexicalBundlesActivitiesIcon from "./icons/LexicalBundlesActivitiesIcon";
import { useState } from 'react';

interface ActivitiesWelcomeProps {
    onStartExploreActivity: () => void;
    onStartLexicalBundlesActivity: () => void;
    projectName: string;
}

type PendingActivityKind = "explore" | "lexical" | null;

const ActivitiesWelcome: React.FC<ActivitiesWelcomeProps> = ({ onStartLexicalBundlesActivity, onStartExploreActivity, projectName }) => {

    const [pendingActivity, setPendingActivity] = useState<PendingActivityKind>(null);

    const openExploreModal = () => {
        setPendingActivity("explore");
    }

    const openLexicalBundlesModal = () => {
        setPendingActivity("lexical");
    }

    const closeModal = () => {
        setPendingActivity(null);
    }

    const confirmStart = () => {
        if (pendingActivity === "explore") {
            onStartExploreActivity()
        }

        if(pendingActivity === "lexical") {
            onStartLexicalBundlesActivity();
        }

        closeModal();
    }

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
                            onClick={openExploreModal}
                        >
                            Create Activity
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
                            onClick={openLexicalBundlesModal}
                        >
                            Create Lexical Bundles
                        </button>
                    </div>
                </div>
            </div>
            {pendingActivity ? (
                <div
                    className="activities-welcome-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="activities-welcome-modal-title"
                >
                    <div className="activities-welcome-modal-backdrop" onClick={closeModal} />
                    <div className="activities-welcome-modal-panel">
                        <p className="activities-welcome-modal-eyebrow">Create Activity</p>
                        <h2 id="activities-welcome-modal-title">
                            {pendingActivity === "explore"
                                ? "Start exploration activity"
                                : "Start lexical bundles activity"
                            }
                        </h2>
                        <p className="activities-welcome-modal-copy">
                            {
                                pendingActivity === "explore"
                                    ? `Create a new exploration activity for ${projectName}.`
                                    : `Create a new lexical bundles activity for ${projectName}`
                            }
                        </p>
                        <div className="activities-welcome-modal-action">
                            <button
                                type="button"
                                className="activities-welcome-modal-cancel"
                                onClick={closeModal}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="activities-welcome-modal-confirm"
                                onClick={confirmStart}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            ):null}
            
        </section>
    );
};

export default ActivitiesWelcome;