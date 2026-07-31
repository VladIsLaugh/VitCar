import Link from 'next/link';

interface LogoProps {
  /** Force white text — use inside the always-dark footer */
  white?: boolean;
}

export function VitAutoLogo({ white }: LogoProps) {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold" aria-label="VitAuto">
      <span className={white ? 'text-white' : 'text-primary dark:text-foreground'}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <rect width="22" height="22" rx="5" fill="currentColor" />
          <path
            d="M5 6.5L11 16l6-9.5"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="17" cy="6" r="1.6" fill="#10B981" />
        </svg>
      </span>
      <span className={white ? 'text-white' : 'text-foreground'}>VitAuto</span>
    </Link>
  );
}
