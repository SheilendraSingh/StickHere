
import path from "path";

export const MEDIA_CATEGORIES = Object.freeze({
  image: "image",
  video: "video",
  audio: "audio",
  document: "document",
  gif: "gif",
  sticker: "sticker",
});

export const DEFAULT_ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const getExtension = (value = "") => {
  if (!value) return "";

  if (String(value).includes("/")) {
    const [, subtype = ""] = String(value).split("/");
    return subtype.split(";")[0].replace("x-", "").trim().toLowerCase();
  }

  return path.extname(String(value)).replace(".", "").trim().toLowerCase();
};

export const sanitizeFilename = (filename = "") =>
  String(filename)
    .trim()
    .replace(/[^\w.\-()\s]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 255);

export const inferFileCategory = (mimeType = "") => {
  const normalized = String(mimeType).trim().toLowerCase();
  if (!normalized) return MEDIA_CATEGORIES.document;
  if (normalized === "image/gif") return MEDIA_CATEGORIES.gif;
  if (normalized.startsWith("image/")) return MEDIA_CATEGORIES.image;
  if (normalized.startsWith("video/")) return MEDIA_CATEGORIES.video;
  if (normalized.startsWith("audio/")) return MEDIA_CATEGORIES.audio;
  return MEDIA_CATEGORIES.document;
};

export const isAllowedMimeType = (
  mimeType = "",
  allowedMimeTypes = DEFAULT_ALLOWED_MIME_TYPES,
) => allowedMimeTypes.has(String(mimeType).trim().toLowerCase());

export const bytesToMB = (bytes = 0, precision = 2) => {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Number((value / (1024 * 1024)).toFixed(precision));
};

export const formatBytes = (bytes = 0) => {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1,
  );
  const scaled = value / 1024 ** index;
  return `${scaled.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
};

export const buildDataUri = ({ buffer, mimeType }) => {
  if (!buffer || !mimeType) return "";
  return `data:${mimeType};base64,${Buffer.from(buffer).toString("base64")}`;
};

export const buildAttachmentFromUpload = (uploadResult = {}, options = {}) => ({
  url: uploadResult.secure_url || uploadResult.url || "",
  publicId: uploadResult.public_id || "",
  fileType: options.fileType || inferFileCategory(options.mimeType),
  filename:
    sanitizeFilename(options.filename) ||
    sanitizeFilename(uploadResult.original_filename) ||
    "",
  mimeType: String(options.mimeType || "").trim().toLowerCase(),
  size: Number(options.size || uploadResult.bytes || 0),
  extension:
    options.extension ||
    getExtension(options.filename || "") ||
    getExtension(options.mimeType || "") ||
    getExtension(uploadResult.format || ""),
  width: Number(uploadResult.width || 0),
  height: Number(uploadResult.height || 0),
  durationSeconds: Number(uploadResult.duration || 0),
});

export default {
  MEDIA_CATEGORIES,
  DEFAULT_ALLOWED_MIME_TYPES,
  getExtension,
  sanitizeFilename,
  inferFileCategory,
  isAllowedMimeType,
  bytesToMB,
  formatBytes,
  buildDataUri,
  buildAttachmentFromUpload,
};
