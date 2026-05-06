type DependencyActivitiesIconProps = {
    size?: number;
};

const DependencyActivitiesIcon = ({ size = 72 }: DependencyActivitiesIconProps) => {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
        >
            <circle cx="5.5" cy="7" r="2" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="18.5" cy="7" r="2" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="12" cy="17" r="2.4" stroke="currentColor" strokeWidth="1.6" />
            <path d="M7 8.2L10.4 14.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M17 8.2L13.6 14.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M8.2 7H15.8" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2.2 2.2" strokeLinecap="round" />
        </svg>
    );
};

export default DependencyActivitiesIcon;
