// src/components/ButtonLink.tsx

import Link from "next/link";
import clsx from "clsx";

interface ButtonLinkProps {
  field: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export default function ButtonLink({
  field,
  className,
  children,
  onClick,
}: ButtonLinkProps) {
  return (
    <Link
      href={field}
      onClick={onClick}
      className={clsx(
        "relative inline-flex h-fit w-fit rounded-full border border-blue-600/30 bg-blue-600 px-4 py-2 text-white outline-none ring-blue-300 transition-colors after:absolute after:inset-0 after:-z-10 after:animate-pulse after:rounded-full after:bg-blue-400 after:bg-opacity-0 after:blur-md after:transition-all after:duration-500 hover:border-blue-700 hover:bg-blue-700 after:hover:bg-opacity-15 focus:ring-2",
        className,
      )}
    >
      {children}
    </Link>
  );
}
