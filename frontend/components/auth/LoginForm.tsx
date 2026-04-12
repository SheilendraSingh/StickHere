"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { useAuth } from "@/hooks/useAuth";

export default function LoginForm() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    try {
      await login({ email, password });
      router.replace("/chat");
    } catch {
      // handled by context error state
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      {error ? (
        <p className="rounded-md border border-red-300/40 bg-[#091413]/70 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <Button type="submit" isLoading={isLoading}>
        Login
      </Button>
      <p className="text-center text-sm text-[#B0E4CC]/85">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="font-semibold text-[#B0E4CC] underline-offset-4 hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
