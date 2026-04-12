const buildErrorPayload = (message, req) => ({
  success: false,
  message,
  ...(process.env.NODE_ENV !== "production" && {
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  }),
});

export const notFound = (req, res, _next) => {
  return res.status(404).json(buildErrorPayload("Route not found", req));
};

export const errorHandler = (err, req, res, _next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err?.message || "Internal server error";

  // Mongoose bad ObjectId or cast errors
  if (err?.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path || "request"}: ${err.value}`;
  }

  // Mongoose validation errors
  if (err?.name === "ValidationError") {
    statusCode = 400;
    const details = Object.values(err.errors || {})
      .map((e) => e.message)
      .filter(Boolean);
    if (details.length > 0) {
      message = details.join(", ");
    }
  }

  // Mongo duplicate key
  if (err?.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    message = `${field} already exists`;
  }

  // JWT auth errors
  if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Invalid or expired token";
  }

  // Multer and upload errors
  if (err?.name === "MulterError") {
    statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "Uploaded file is too large";
    } else {
      message = err.message || "Upload error";
    }
  }

  if (process.env.NODE_ENV !== "production") {
    console.error("Unhandled error:", err);
  }

  return res.status(statusCode).json({
    ...buildErrorPayload(message, req),
    ...(process.env.NODE_ENV !== "production" && {
      stack: err?.stack,
    }),
  });
};
