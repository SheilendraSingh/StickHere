import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-zinc-100 px-4 py-8">
      <section className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-zinc-900">Create Account</h1>
        <p className="mb-6 text-sm text-zinc-600">
          Join StickHere and start location-based chat.
        </p>
        <SignupForm />
      </section>
    </main>
  );
}
