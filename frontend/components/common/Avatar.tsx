"use client";

import Image from "next/image";

interface AvatarProps {
  name?: string;
  src?: string;
  size?: number;
  className?: string;
}

const getInitials = (name = "") => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "?";
  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
};

export default function Avatar({
  name = "",
  src = "",
  size = 36,
  className = "",
}: AvatarProps) {
  const initials = getInitials(name);

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#408A71]/70 bg-[#285A48] text-xs font-semibold text-[#B0E4CC] ${className}`}
      style={{ width: size, height: size }}
      aria-label={name || "User avatar"}
    >
      {src ? (
        <Image
          src={src}
          alt={name || "Avatar"}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
