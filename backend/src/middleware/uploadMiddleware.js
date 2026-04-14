import multer from "multer";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const normalizeMimeType = (value = "") =>
  String(value).trim().toLowerCase().split(";")[0];

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/ogg",
  "audio/webm",
  "audio/mp4",
  "audio/aac",
  "audio/m4a",
  "audio/x-m4a",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const mimeType = normalizeMimeType(file?.mimetype);
  if (!mimeType || !allowedMimeTypes.has(mimeType)) {
    const error = new Error("Unsupported file type");
    error.statusCode = 400;
    return cb(error);
  }
  cb(null, true);
};

const mediaUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

export const uploadSingleMedia = mediaUpload.single("file");
export const uploadMultipleMedia = mediaUpload.array("files", 10);
