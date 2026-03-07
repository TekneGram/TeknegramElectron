import TeknegramIcon from './MainView/TeknegramIcon';
import '@/styles/layout.css';
import { useListProjectsQuery } from '@/features/ProjectsTinyView/hooks/useProjectsQuery';
import CreateProjectModal from '@/features/CreateProjectModal/CreateProjectModal';

interface MainViewProps {
    modalIsOpen: boolean;
    onOpenModal: () => void;
    onCloseModal: () => void;
}

const MainView: React.FC<MainViewProps> = ({ onOpenModal, onCloseModal, modalIsOpen }) => {

    const { data, isLoading, isError } = useListProjectsQuery();

    if (isLoading) {
        return(<p>Loading!</p>);
    }

    if (isError) {
        return(<p>Something went badly wrong!</p>);
    }

    if (data === undefined || data.length === 0) {
        return(
            <section className="main-view-welcome">
                <div className="main-view-welcome-card">
                    <div className="title">
                        <h1>Teknegram</h1>
                    </div>
                    <div className="welcome-message">
                        <p>Advanced Corpus Linguistics Search and Analytics</p>
                        <p>Start a new project to build a corpus and explore your data.</p>
                    </div>
                    <div className="logo-area">
                        <TeknegramIcon />
                    </div>
                    <div className="welcome-actions">
                        <button 
                            className="main-view-welcome-button"
                            onClick={onOpenModal}
                        >
                            Start New Project
                        </button>
                    </div>
                </div>
                {
                    modalIsOpen ? <CreateProjectModal onClose={onCloseModal} /> : <></>
                }
        
            </section>
            
        );
    }

    return (
        <section className="main-view">
            <div>
                <p>The main view</p>
            </div>
            {
                modalIsOpen
                    ? <div onClick={onCloseModal}>HELLO!</div>
                    : <></>
            }
        </section>
    );
};

export default MainView;
