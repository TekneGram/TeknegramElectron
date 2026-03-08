import '@/styles/layout.css';
import CreateProjectButton from './Sidebar/CreateProjectButton';

interface SidebarProps {
    onOpenModal: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onOpenModal }) => {
    return (
        <aside className="sidebar">
            <div>
                <CreateProjectButton
                    onClickCreate={onOpenModal}
                />
            </div>
        </aside>
    );
};

export default Sidebar;
