import '@/styles/layout.css';
import CreateProjectModal from '@/features/CreateProjectModal/CreateProjectModal';
import { useState } from 'react';
import SettingsView from './MainView/SettingsView';
import HomeView from './MainView/HomeView';
import { useNavigation } from '@/app/providers/useNavigation';

interface MainViewProps {
    modalIsOpen: boolean;
    onOpenModal: () => void;
    onCloseModal: () => void;
}

const MainView: React.FC<MainViewProps> = ({ onOpenModal, onCloseModal, modalIsOpen }) => {
    const [projectCreationCount, setProjectCreationCount] = useState(0);
    const { navigationState } = useNavigation();

    const content = navigationState.kind === "settings"
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
