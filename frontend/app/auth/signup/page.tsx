import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#091413] bg-[radial-gradient(circle_at_top,#285A48_0%,#091413_60%)] px-4 py-8">
      <section className="w-full max-w-md rounded-xl border border-[#408A71]/70 bg-[#285A48]/90 p-6 shadow-[0_20px_45px_rgba(9,20,19,0.45)] backdrop-blur">
        <h1 className="mb-1 text-2xl font-bold text-[#B0E4CC]">Create Account</h1>
        <p className="mb-6 text-sm text-[#B0E4CC]/85">
          Join StickHere and start location-based chat.
        </p>
        <SignupForm />
      </section>
    </main>
  );
}
