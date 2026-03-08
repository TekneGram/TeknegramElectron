import '@/styles/layout.css';
import CreateProjectIcon from './Sidebar/CreateProjectIcon';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div>
                <button className="sidebar-create-project-button" aria-label="New Project">
                    <CreateProjectIcon />
                    <span className="sidebar-tooltip">New Project</span>
                </button>
                
            </div>
        </aside>
    );
};

export default Sidebar;
