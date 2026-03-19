
const TeknegramIcon = () => {

    return (
        <svg
            className="logo"
            viewBox="0 0 120 120"
            xmlns="http://www.w3.org/2000/svg"
            >

            <defs>
                <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
                </filter>
            </defs>


            <rect x="20" y="20" width="20" height="20" rx="4" fill="var(--color-logo)">
                <animateTransform attributeName="transform"
                    type="translate"
                    values="0 0; 0 -8; 0 0"
                    dur="2s"
                    repeatCount="indefinite"
                    begin="0s"
                />
            </rect>

            <rect x="50" y="20" width="20" height="20" rx="4" fill="var(--color-logo)">
                <animateTransform attributeName="transform"
                    type="translate"
                    values="0 0; 0 -8; 0 0"
                    dur="2s"
                    repeatCount="indefinite"
                    begin="0.5s"
                />
            </rect>

            <rect x="80" y="20" width="20" height="20" rx="4" fill="var(--color-logo)">
                <animateTransform attributeName="transform"
                    type="translate"
                    values="0 0; 0 -8; 0 0"
                    dur="2s"
                    repeatCount="indefinite"
                    begin="1.0s"
                />
            </rect>


            <rect
                x="50"
                y="50"
                width="20"
                height="20"
                rx="4"
                fill="var(--color-logo)"
                filter="url(#glow)"
            >
                <animate
                    attributeName="opacity"
                    values="1;0.7;1"
                    dur="2.5s"
                    repeatCount="indefinite"
                />
            </rect>


            <rect
                x="50"
                y="80"
                width="20"
                height="20"
                rx="4"
                fill="var(--color-logo)"
            />
        </svg>
    );
};

export default TeknegramIcon;