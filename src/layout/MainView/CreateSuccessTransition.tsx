import "@/styles/layout.css"
import TeknegramIcon from "./icons/TeknegramIcon"

const CreateSuccessTransition = () => {

    return (
        <section className="main-view-transition main-view-grid-surface">
            <div className="main-view-transition-card">
                <div className="main-view-transition-badge">Project Created</div>
                <div className="main-view-brand-icon-shell" aria-hidden="true">
                    <div className="main-view-brand-icon-ring" />
                    <div className="main-view-brand-icon-core">
                        <TeknegramIcon />
                    </div>
                </div>
                <div className="main-view-transition-copy">
                    <h1>Corpus created successfully.</h1>
                    <p>
                        Teknegram is refreshing your projects so you can jump straight into the new workspace.
                    </p>
                </div>
                <div className="main-view-transition-progress" aria-hidden="true">
                    <span className="main-view-transition-progress-bar" />
                </div>
                <p className="main-view-transition-status">
                    Preparing project selection view...
                </p>
            </div>
        </section>
    );
};

export default CreateSuccessTransition;
