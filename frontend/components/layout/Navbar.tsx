"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { href: "/chat", label: "Chat" },
  { href: "/profile", label: "Profile" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between border-b border-[#408A71]/45 bg-[#285A48] px-4 py-3">
      <Link href="/chat" className="text-base font-bold text-[#B0E4CC]">
        StickHere
      </Link>

      <div className="flex items-center gap-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-1.5 text-sm transition ${
                isActive
                  ? "bg-[#408A71] text-[#B0E4CC]"
                  : "text-[#B0E4CC]/85 hover:bg-[#091413]/45"
              }`}
            >
              {link.label}
            </Link>
          );
        })}

        {isAuthenticated ? (
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-md border border-[#408A71]/70 px-3 py-1.5 text-sm text-[#B0E4CC] hover:bg-[#091413]/45"
          >
            Logout
          </button>
        ) : null}
      </div>
    </nav>
  );
}
