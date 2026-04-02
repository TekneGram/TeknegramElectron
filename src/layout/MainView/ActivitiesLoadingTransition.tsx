import "@/styles/layout.css";
import "@/styles/badge-style.css";
import TeknegramIcon from "./icons/TeknegramIcon";

const ActivitiesLoadingTransition = () => {
    return (
        <section className="main-view-transition main-view-grid-surface" aria-live="polite">
            <div className="main-view-transition-card">
                <div className="badge-pill badge-pill-primary badge-pill-md">Activities Loading</div>
                <div className="main-view-brand-icon-shell" aria-hidden="true">
                    <div className="main-view-brand-icon-ring" />
                    <div className="main-view-brand-icon-core">
                        <TeknegramIcon />
                    </div>
                </div>
                <div className="main-view-transition-copy">
                    <h1>Loading activities.</h1>
                    <p>
                        Teknegram is preparing the corpus activity workspace.
                    </p>
                </div>
                <div className="main-view-transition-progress" aria-hidden="true">
                    <span className="main-view-transition-progress-bar" />
                </div>
                <p className="main-view-transition-status">
                    Gathering activity data...
                </p>
            </div>
        </section>
    );
};

export default ActivitiesLoadingTransition;
