import LlmSettingsTable from "@/features/LlmSettingsTable/LlmSettingsTable";
import "@/styles/text-style.css";

const SettingsView = () => {
    return (
        <section className="main-view-settings main-view-grid-surface" aria-labelledby="settings-view-title">
            <header className="main-view-settings-header">
                <p className="eyebrow-text eyebrow-text-md">Settings</p>
                <h1 id="settings-view-title">Model and provider configuration</h1>
            </header>
            <LlmSettingsTable />
        </section>
    );
};

export default SettingsView;
