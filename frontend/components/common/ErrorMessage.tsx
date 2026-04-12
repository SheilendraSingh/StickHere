interface ErrorMessageProps {
  message?: string | null;
  className?: string;
}

export default function ErrorMessage({
  message,
  className = "",
}: ErrorMessageProps) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className={`rounded-md border border-red-300/40 bg-[#091413]/70 px-3 py-2 text-sm text-red-200 ${className}`}
    >
      {message}
    </p>
  );
}
