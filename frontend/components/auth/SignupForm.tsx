"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { useAuth } from "@/hooks/useAuth";

export default function SignupForm() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    try {
      await register({ name, email, password, country, state, city });
      router.replace("/chat");
    } catch {
      // handled by context error state
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
      <Input
        label="Name"
        placeholder="Your full name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />
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
        placeholder="At least 8 characters"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <Input
        label="Country"
        placeholder="India"
        value={country}
        onChange={(event) => setCountry(event.target.value)}
      />
      <Input
        label="State"
        placeholder="Rajasthan"
        value={state}
        onChange={(event) => setState(event.target.value)}
      />
      <Input
        label="City"
        placeholder="Kota"
        value={city}
        onChange={(event) => setCity(event.target.value)}
      />
      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      <Button type="submit" isLoading={isLoading}>
        Create Account
      </Button>
      <p className="text-center text-sm text-zinc-600">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-sky-600">
          Login
        </Link>
      </p>
    </form>
  );
}
