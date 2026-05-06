type CreateCollocationActivityIconProps = {
    size?: number;
};

const CreateCollocationActivityIcon = ({ size = 32 }: CreateCollocationActivityIconProps) => {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
        >
            <circle cx="8" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.7" />
            <circle cx="16" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.7" />
            <path d="M10.5 12H13.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
            <path d="M8 8.6V7.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M16 16.8V15.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    );
};

export default CreateCollocationActivityIcon;
