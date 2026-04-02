type LexicalBundlesActivitiesIconProps = {
    size?: number;
};

const LexicalBundlesActivitiesIcon = ({ size = 72 }: LexicalBundlesActivitiesIconProps) => {
    return (
        <svg
            className="logo"
            aria-hidden="true"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
        >
            <rect
                x="3.75"
                y="5"
                width="6.5"
                height="14"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.7"
            />
            <path
                d="M5.5 8H8.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
            <path
                d="M5.5 11H8.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
            <path
                d="M5.5 14H7.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
            <path
                d="M10.75 8.25H13"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
            <path
                d="M10.75 12H14.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
            <path
                d="M10.75 15.75H12.75"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
            <path
                d="M14.25 8.25H20"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
            />
            <path
                d="M15.75 12H20"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
            />
            <path
                d="M14 15.75H20"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
            />
            <path
                d="M13 7V17"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default LexicalBundlesActivitiesIcon;
