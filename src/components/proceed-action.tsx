import Image from "next/image";
import Link from "next/link";

type ProceedActionProps = {
  id?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "icon" | "shrunk" | "shrunk-white";
};

export function ProceedAction({
  id,
  href,
  onClick,
  disabled = false,
  variant = "icon",
}: ProceedActionProps) {
  const className = `inline-flex transition-opacity duration-300 hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30 ${
    variant === "icon" ? "h-[44px] w-[44px]" : "h-[44px] w-[123px]"
  }`;
  const imageProps =
    variant === "shrunk"
      ? {
          src: "/assets/button-icon-text-shrunk-proceed.png",
          width: 123,
          height: 44,
        }
      : variant === "shrunk-white"
        ? {
            src: "/assets/button-icon-text-shrunk-white.png",
            width: 123,
            height: 44,
          }
      : {
          src: "/assets/forward-button-icon.png",
          width: 44,
          height: 44,
        };

  const content = (
    <Image
      src={imageProps.src}
      alt="Proceed"
      width={imageProps.width}
      height={imageProps.height}
      priority
      className="h-full w-full object-contain"
    />
  );

  if (href) {
    return (
      <Link id={id} href={href} aria-label="Proceed" className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button
      id={id}
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
