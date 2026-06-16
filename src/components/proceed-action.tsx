import Image from "next/image";
import Link from "next/link";

type ProceedActionProps = {
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export function ProceedAction({
  href,
  onClick,
  disabled = false,
}: ProceedActionProps) {
  const className =
    "inline-flex h-[44px] w-[123px] transition-opacity duration-300 hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30";

  const content = (
    <Image
      src="/assets/button-icon-text-shrunk-proceed.png"
      alt="Proceed"
      width={123}
      height={44}
      priority
      className="h-full w-full object-contain"
    />
  );

  if (href) {
    return (
      <Link href={href} aria-label="Proceed" className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Proceed"
      className={className}
    >
      {content}
    </button>
  );
}
