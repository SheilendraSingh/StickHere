"use client";

import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <label className="flex w-full flex-col gap-1">
      {label ? <span className="text-sm font-medium text-[#B0E4CC]">{label}</span> : null}
      <input
        className={`h-11 rounded-md border border-[#408A71] bg-[#091413]/70 px-3 text-sm text-[#B0E4CC] placeholder:text-[#B0E4CC]/55 outline-none ring-[#B0E4CC]/30 transition focus:border-[#B0E4CC] focus:ring-2 ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-red-200">{error}</span> : null}
    </label>
  );
}
