import Link from "next/link";

type DiamondActionProps = {
  direction: "left" | "right";
  label: string;
  href?: string;
  compact?: boolean;
  id?: string;
};

export function DiamondAction({
  direction,
  label,
  href,
  compact = false,
  id,
}: DiamondActionProps) {
  const isLeft = direction === "left";
  const className = `group relative inline-flex h-9 items-center justify-center whitespace-nowrap ${
    compact ? "gap-4 text-[12px] font-bold" : "gap-4 px-3 py-1 text-sm font-normal"
  } transition-transform duration-300 hover:scale-105`;

  const content = (
    <>
      {isLeft && <Diamond direction={direction} compact={compact} />}
      <span>{label}</span>
      {!isLeft && <Diamond direction={direction} compact={compact} />}
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
    <button id={id} type="button" className={className}>
      {content}
    </button>
  );
}

function Diamond({
  direction,
  compact,
}: {
  direction: "left" | "right";
  compact: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`relative block shrink-0 rotate-45 border border-[#1A1B1C] transition-transform duration-300 group-hover:scale-110 ${
        compact ? "size-6" : "size-[30px]"
      }`}
    >
      <span
        className={`absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 -rotate-45 text-[#1A1B1C] ${
          direction === "left" ? "rotate-180" : ""
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={compact ? "size-3" : "size-[14px]"}
        >
          <path fill="currentColor" d="M8 5v14l11-7z" />
        </svg>
      </span>
    </span>
  );
}
