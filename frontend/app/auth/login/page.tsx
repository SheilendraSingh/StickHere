import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-zinc-100 px-4">
      <section className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-zinc-900">Welcome Back</h1>
        <p className="mb-6 text-sm text-zinc-600">Login to continue chatting.</p>
        <LoginForm />
      </section>
    </main>
  );
}
