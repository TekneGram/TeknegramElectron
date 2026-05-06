type VocabActivitiesIconProps = {
    size?: number;
};

const VocabActivitiesIcon = ({ size = 72 }: VocabActivitiesIconProps) => {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
        >
            <rect
                x="3.5"
                y="5"
                width="7"
                height="14"
                rx="1.8"
                stroke="currentColor"
                strokeWidth="1.7"
            />
            <rect
                x="11"
                y="5"
                width="9.5"
                height="14"
                rx="1.8"
                stroke="currentColor"
                strokeWidth="1.7"
            />
            <path d="M6 9H8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M6 12H8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M13.5 9H18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M13.5 12H18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M13.5 15H16.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
    );
};

export default VocabActivitiesIcon;
