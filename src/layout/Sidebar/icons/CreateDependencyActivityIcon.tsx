type CreateDependencyActivityIconProps = {
    size?: number;
};

const CreateDependencyActivityIcon = ({ size = 32 }: CreateDependencyActivityIconProps) => {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
        >
            <circle cx="5.8" cy="7.2" r="1.9" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="18.2" cy="7.2" r="1.9" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="12" cy="16.7" r="2.3" stroke="currentColor" strokeWidth="1.6" />
            <path d="M7.2 8.4L10.4 14.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M16.8 8.4L13.6 14.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M8.1 7.2H15.9" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 2" strokeLinecap="round" />
        </svg>
    );
};

export default CreateDependencyActivityIcon;
