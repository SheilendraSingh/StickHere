
import { getExtension } from "./fileHelper.js";

export const SUPPORTED_AUDIO_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/mp4",
  "audio/aac",
]);

export const normalizeAudioMimeType = (mimeType = "") =>
  String(mimeType).trim().toLowerCase();

export const isAudioMimeType = (mimeType = "") =>
  normalizeAudioMimeType(mimeType).startsWith("audio/");

export const isSupportedAudioMimeType = (mimeType = "") =>
  SUPPORTED_AUDIO_MIME_TYPES.has(normalizeAudioMimeType(mimeType));

export const getAudioExtension = (mimeType = "", fallback = "mp3") => {
  const ext = getExtension(mimeType);
  return ext || fallback;
};

export const sanitizeAudioFilename = (filename = "audio") => {
  const normalized = String(filename)
    .trim()
    .replace(/[^\w.\-()\s]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 240);
  return normalized || "audio";
};

export const createAudioFilename = ({
  filename = "",
  mimeType = "",
  prefix = "audio",
} = {}) => {
  const safeBase = sanitizeAudioFilename(filename || prefix);
  if (safeBase.includes(".")) return safeBase;
  return `${safeBase}.${getAudioExtension(mimeType)}`;
};

export const formatAudioDuration = (seconds = 0) => {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export const estimateAudioBitrateKbps = ({
  bytes = 0,
  durationSeconds = 0,
} = {}) => {
  const size = Number(bytes);
  const duration = Number(durationSeconds);
  if (!Number.isFinite(size) || !Number.isFinite(duration) || duration <= 0) {
    return 0;
  }
  return Math.round((size * 8) / 1000 / duration);
};

export const buildAudioMetadata = ({
  bytes = 0,
  durationSeconds = 0,
  mimeType = "",
  filename = "",
} = {}) => {
  const normalizedDuration = Number(durationSeconds || 0);
  return {
    mimeType: normalizeAudioMimeType(mimeType),
    filename: createAudioFilename({ filename, mimeType }),
    extension: getAudioExtension(mimeType),
    durationSeconds: normalizedDuration,
    durationLabel: formatAudioDuration(normalizedDuration),
    sizeBytes: Number(bytes || 0),
    estimatedBitrateKbps: estimateAudioBitrateKbps({
      bytes,
      durationSeconds: normalizedDuration,
    }),
  };
};

export default {
  SUPPORTED_AUDIO_MIME_TYPES,
  normalizeAudioMimeType,
  isAudioMimeType,
  isSupportedAudioMimeType,
  getAudioExtension,
  sanitizeAudioFilename,
  createAudioFilename,
  formatAudioDuration,
  estimateAudioBitrateKbps,
  buildAudioMetadata,
};
