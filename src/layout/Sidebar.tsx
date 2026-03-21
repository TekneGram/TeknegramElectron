import '@/styles/layout.css';
import '@/styles/tool-tip.css';
import CreateProjectButton from './Sidebar/buttons/CreateProjectButton';
import ControlPanel from './Sidebar/ControlPanel';

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
            <div>
                <ControlPanel />
            </div>
        </aside>
    );
};

export default Sidebar;
