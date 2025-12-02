"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-center relative">
      <ul className="flex items-center justify-center gap-8">
        <li
          className={`font-semibold py-2 px-4 ${
            pathname === "/" ? "text-primary" : ""
          }`}
        >
          <Link href="/">Home</Link>
        </li>

        <li
          className={`font-semibold py-2 px-4 ${
            pathname === "/favorites" ? "text-primary" : ""
          }`}
        >
          <Link href="/favorites">Favoriten</Link>
        </li>

        <span className=""></span>
      </ul>
    </nav>
  );
}
