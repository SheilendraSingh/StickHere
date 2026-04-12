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
    "bg-sky-600 text-white hover:bg-sky-700 disabled:bg-sky-400 disabled:cursor-not-allowed",
  secondary:
    "bg-zinc-200 text-zinc-900 hover:bg-zinc-300 disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed",
  ghost:
    "bg-transparent text-zinc-700 hover:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed",
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
