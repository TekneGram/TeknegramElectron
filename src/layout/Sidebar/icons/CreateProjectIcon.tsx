type CreateProjectIconProps = {
    size?: number;
};

const CreateProjectIcon = ({ size = 32 }: CreateProjectIconProps) => {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
        >
            <path
                d="M3.75 7.25C3.75 6.15 4.65 5.25 5.75 5.25H9.1L10.6 6.8H18.25C19.35 6.8 20.25 7.7 20.25 
                    8.8V16.75C20.25 17.85 19.35 18.75 18.25 18.75H5.75C4.65 18.75 3.75 17.85 3.75 16.75V7.25Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
            />
            <path
                d="M12 10.25V15.25"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
            <path
                d="M9.5 12.75H14.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default CreateProjectIcon;