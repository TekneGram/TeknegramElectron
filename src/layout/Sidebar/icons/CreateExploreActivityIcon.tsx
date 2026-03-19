type CreateExploreActivityIconProps = {
    size?: number;
};

const CreateExploreActivityIcon = ({ size = 32 }: CreateExploreActivityIconProps) => {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
        >
            <rect
                x="4"
                y="5"
                width="11"
                height="14"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.7"
            />
            <path
                d="M7.25 9H11.75"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
            <path
                d="M7.25 12H10.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
            <path
                d="M7.25 15H9.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
            <circle
                cx="15.5"
                cy="14.5"
                r="3.25"
                stroke="currentColor"
                strokeWidth="1.7"
            />
            <path
                d="M17.85 16.85L20 19"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default CreateExploreActivityIcon;
