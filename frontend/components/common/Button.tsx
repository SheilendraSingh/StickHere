"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
  children: ReactNode;
}

const variantClassMap: Record<Variant, string> = {
  primary:
    "bg-[#B0E4CC] text-[#091413] hover:bg-[#9fd9c0] disabled:bg-[#5f8f7b] disabled:text-[#d2efe2] disabled:cursor-not-allowed",
  secondary:
    "bg-[#285A48] text-[#B0E4CC] hover:bg-[#316b56] disabled:bg-[#244d3f] disabled:text-[#87baa5] disabled:cursor-not-allowed",
  ghost:
    "bg-transparent text-[#B0E4CC] hover:bg-[#285A48]/60 disabled:text-[#7ea896] disabled:cursor-not-allowed",
};

export default function Button({
  variant = "primary",
  className = "",
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition-colors ${variantClassMap[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Please wait..." : children}
    </button>
  );
}
