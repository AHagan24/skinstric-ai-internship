import Image from "next/image";
import Link from "next/link";

export function BackAction() {
  return (
    <Link
      href="/"
      aria-label="Back"
      className="group inline-flex items-center gap-3 sm:gap-4"
    >
      <span className="relative flex size-11 items-center justify-center sm:size-12">
        <Image
          src="/back-button-icon.png"
          alt=""
          width={43}
          height={43}
          className="size-11 transition-transform duration-300 ease-out group-hover:scale-105 sm:size-12"
        />
      </span>
      <span className="text-xs font-semibold sm:text-sm">BACK</span>
    </Link>
  );
}
