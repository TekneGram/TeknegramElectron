type IconProps = {
    size?: number;
  };

  const SunIcon = ({ size = 18 }: IconProps) => {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="4.25"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M12 1.75V4.25"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M12 19.75V22.25"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M1.75 12H4.25"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M19.75 12H22.25"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M4.75 4.75L6.55 6.55"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M17.45 17.45L19.25 19.25"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M17.45 6.55L19.25 4.75"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M4.75 19.25L6.55 17.45"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  export default SunIcon;