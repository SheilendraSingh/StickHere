interface LoaderProps {
  label?: string;
  className?: string;
  size?: number;
}

export default function Loader({
  label = "Loading...",
  className = "",
  size = 18,
}: LoaderProps) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className="inline-block animate-spin rounded-full border-2 border-[#408A71] border-t-[#B0E4CC]"
        style={{ width: size, height: size }}
        aria-hidden
      />
      <span className="text-sm text-[#B0E4CC]/85">{label}</span>
    </div>
  );
}
