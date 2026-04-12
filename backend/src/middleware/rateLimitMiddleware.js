const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
};

const now = () => Date.now();

export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000, // 15 minutes
  max = 100,
  message = "Too many requests, please try again later",
  keyGenerator = getClientIp,
} = {}) => {
  const buckets = new Map();

  // Periodically remove expired buckets to keep memory bounded.
  const cleanupTimer = setInterval(() => {
    const current = now();
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.expiresAt <= current) {
        buckets.delete(key);
      }
    }
  }, Math.max(10_000, Math.floor(windowMs / 2)));
  if (typeof cleanupTimer.unref === "function") cleanupTimer.unref();

  return (req, res, next) => {
    const key = keyGenerator(req);
    const current = now();
    const existing = buckets.get(key);

    if (!existing || existing.expiresAt <= current) {
      buckets.set(key, { count: 1, expiresAt: current + windowMs });
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - 1)));
      return next();
    }

    existing.count += 1;
    buckets.set(key, existing);

    const remaining = Math.max(0, max - existing.count);
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));

    if (existing.count > max) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((existing.expiresAt - current) / 1000),
      );
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        success: false,
        message,
      });
    }

    return next();
  };
};

export const generalApiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many API requests. Please try again shortly.",
});

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many auth attempts. Please try again later.",
});

export const mediaUploadRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: "Too many upload requests. Please wait before trying again.",
});
