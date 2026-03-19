import '@/styles/layout.css';
import CreateProjectModal from '@/features/CreateProjectModal/CreateProjectModal';
import { useState } from 'react';
import SettingsView from './MainView/SettingsView';
import HomeView from './MainView/HomeView';
import type { MainViewRoute } from './MainView/mainViewRoute';

interface MainViewProps {
    modalIsOpen: boolean;
    onOpenModal: () => void;
    onCloseModal: () => void;
    route: MainViewRoute;
}

const MainView: React.FC<MainViewProps> = ({ onOpenModal, onCloseModal, modalIsOpen, route }) => {
    const [projectCreationCount, setProjectCreationCount] = useState(0);

    const content = route === "settings"
        ? <SettingsView />
        : <HomeView onOpenModal={onOpenModal} projectCreationCount={projectCreationCount} />;

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
