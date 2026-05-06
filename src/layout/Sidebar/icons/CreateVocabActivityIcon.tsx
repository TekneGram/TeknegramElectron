type CreateVocabActivityIconProps = {
    size?: number;
};

const CreateVocabActivityIcon = ({ size = 32 }: CreateVocabActivityIconProps) => {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
        >
            <rect x="4" y="5" width="7" height="14" rx="1.9" stroke="currentColor" strokeWidth="1.7" />
            <rect x="11.5" y="5" width="8.5" height="14" rx="1.9" stroke="currentColor" strokeWidth="1.7" />
            <path d="M6.5 9H8.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M6.5 12H8.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M14 9H17.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M14 12H18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M14 15H16.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
    );
};

export default CreateVocabActivityIcon;
