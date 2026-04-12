"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarItems = [
  { href: "/chat/world", label: "World" },
  { href: "/chat/region", label: "Region" },
  { href: "/profile", label: "Profile" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r border-[#408A71]/45 bg-[#285A48] p-3">
      <ul className="space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm ${
                  isActive
                    ? "bg-[#408A71] text-[#B0E4CC]"
                    : "text-[#B0E4CC]/85 hover:bg-[#091413]/45"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
