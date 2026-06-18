import Image from "next/image";
import Link from "next/link";

type BackActionProps = {
  id?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "icon" | "shrunk";
};

export function BackAction({
  id,
  onClick,
  disabled = false,
  variant = "icon",
}: BackActionProps) {
  const className = `inline-flex transition-opacity duration-300 hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30 ${
    variant === "shrunk" ? "h-[44px] w-[97px]" : "h-[44px] w-[44px]"
  }`;
  const imageProps =
    variant === "shrunk"
      ? {
          src: "/assets/button-icon-text-shrunk.png",
          width: 97,
          height: 44,
        }
      : {
          src: "/back-button-icon.png",
          width: 44,
          height: 44,
        };

  const content = (
    <Image
      src={imageProps.src}
      alt="Back"
      width={imageProps.width}
      height={imageProps.height}
      priority
      className="h-full w-full object-contain"
    />
  );

  if (onClick) {
    return (
      <button
        id={id}
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
    <Link id={id} href="/" aria-label="Back" className={className}>
      {content}
    </Link>
  );
}
