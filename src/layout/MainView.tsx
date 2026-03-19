import '@/styles/layout.css';
import CreateProjectModal from '@/features/CreateProjectModal/CreateProjectModal';
import { useState } from 'react';
import SettingsView from './MainView/SettingsView';
import HomeView from './MainView/HomeView';
import { useNavigation } from '@/app/providers/useNavigation';
import ActivitiesView from './MainView/ActivitiesView';

interface MainViewProps {
    modalIsOpen: boolean;
    onOpenModal: () => void;
    onCloseModal: () => void;
}

const MainView: React.FC<MainViewProps> = ({ onOpenModal, onCloseModal, modalIsOpen }) => {
    const [projectCreationCount, setProjectCreationCount] = useState(0);
    const { navigationState } = useNavigation();

    function renderContent() {
        switch (navigationState.kind) {
            case "home":
                return <HomeView onOpenModal={onOpenModal} projectCreationCount={projectCreationCount} />;
            case "settings":
                return <SettingsView />
            case "activities":
                return <ActivitiesView />
            default:
                return null;
        }
    }

    const content = renderContent();

    return (
        <>
            {content}
            {modalIsOpen ? (
                <CreateProjectModal
                    onClose={onCloseModal}
                    onSuccessfulCreation={() => setProjectCreationCount((count) => count + 1)}
                />
            ) : null}
        </>
    );
};

export default MainView;
