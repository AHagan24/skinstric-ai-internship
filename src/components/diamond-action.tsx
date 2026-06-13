import Link from "next/link";

type DiamondActionProps = {
  direction: "left" | "right";
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  compact?: boolean;
  variant?: "default" | "bottom";
  id?: string;
};

export function DiamondAction({
  direction,
  label,
  href,
  onClick,
  disabled = false,
  compact = false,
  variant = "default",
  id,
}: DiamondActionProps) {
  const isLeft = direction === "left";
  const isBottomAction = variant === "bottom";
  const className = `group inline-flex items-center justify-center gap-4 whitespace-nowrap text-[#1A1B1C] transition-transform duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100 ${
    isBottomAction
      ? "text-sm font-normal"
      : compact
        ? "h-9 text-[12px] font-bold"
        : "h-9 px-3 py-1 text-sm font-normal"
  }`;

  const content = (
    <>
      {isLeft && (
        <Diamond
          direction={direction}
          compact={compact}
          isBottomAction={isBottomAction}
        />
      )}
      <span>{label}</span>
      {!isLeft && (
        <Diamond
          direction={direction}
          compact={compact}
          isBottomAction={isBottomAction}
        />
      )}
    </>
  );

  if (href) {
    return (
      <Link id={id} href={href} className={className}>
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
      className={className}
    >
      {content}
    </button>
  );
}

function Diamond({
  direction,
  compact,
  isBottomAction,
}: {
  direction: "left" | "right";
  compact: boolean;
  isBottomAction: boolean;
}) {
  return (
    <svg
      viewBox="0 0 44 44"
      aria-hidden="true"
      style={direction === "left" ? { transform: "scaleX(-1)" } : undefined}
      className={`shrink-0 ${isBottomAction ? "h-10 w-10 object-contain" : compact ? "size-6" : "size-12"}`}
    >
      <path
        d="M22 1.5 42.5 22 22 42.5 1.5 22 22 1.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="m18.5 16.5 6.5 5.5-6.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="square"
        strokeLinejoin="miter"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
