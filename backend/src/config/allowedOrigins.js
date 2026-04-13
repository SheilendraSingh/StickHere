const normalizeOrigin = (origin) => String(origin || "").trim();

const parseOriginList = (value) =>
  String(value || "")
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);

export const getAllowedOrigins = () => {
  const listFromEnv = parseOriginList(process.env.FRONTEND_URLS);
  const singleOrigin = normalizeOrigin(process.env.FRONTEND_URL);
  const fallback = "http://localhost:3000";

  const allOrigins = [
    ...listFromEnv,
    ...(singleOrigin ? [singleOrigin] : []),
    fallback,
  ];

  return Array.from(new Set(allOrigins));
};

export const isAllowedOrigin = (origin, allowedOrigins = getAllowedOrigins()) => {
  if (!origin) return true;
  return allowedOrigins.includes(origin);
};

