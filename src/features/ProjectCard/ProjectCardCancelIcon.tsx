const ProjectCardCancelIcon: React.FC = () => {
    return (
        <svg
            aria-hidden="true"
            className="project-card-inline-icon"
            viewBox="0 0 16 16"
            fill="none"
        >
            <path
                d="M4.25 4.25L11.75 11.75"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            <path
                d="M11.75 4.25L4.25 11.75"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default ProjectCardCancelIcon;
