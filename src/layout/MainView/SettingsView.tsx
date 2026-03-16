import LlmSettingsTable from "@/features/LlmSettingsTable/LlmSettingsTable";

const SettingsView = () => {
    return (
        <section className="main-view-settings" aria-labelledby="settings-view-title">
            <header className="main-view-settings-header">
                <p className="main-view-settings-eyebrow">Settings</p>
                <h1 id="settings-view-title">Model and provider configuration</h1>
            </header>
            <LlmSettingsTable />
        </section>
    );
};

export default SettingsView;
