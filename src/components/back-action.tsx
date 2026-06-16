import Image from "next/image";
import Link from "next/link";

type BackActionProps = {
  onClick?: () => void;
  disabled?: boolean;
};

export function BackAction({ onClick, disabled = false }: BackActionProps) {
  const className =
    "inline-flex h-[44px] w-[97px] transition-opacity duration-300 hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30";

  const content = (
    <Image
      src="/assets/button-icon-text-shrunk.png"
      alt="Back"
      width={97}
      height={44}
      priority
      className="h-full w-full object-contain"
    />
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label="Back"
        className={className}
      >
        {content}
      </button>
    );
  }

  return (
    <Link href="/" aria-label="Back" className={className}>
      {content}
    </Link>
  );
}
