
import cloudinary, {
  assertCloudinaryConfigured,
} from "../config/cloudinary.js";

export class StorageServiceError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = "StorageServiceError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const ALLOWED_FILE_TYPES = new Set([
  "image",
  "video",
  "document",
  "audio",
  "gif",
  "sticker",
]);

export const normalizeFileType = (value = "") =>
  String(value).trim().toLowerCase();

export const inferFileTypeFromMime = (mimeType = "") => {
  const normalized = String(mimeType).trim().toLowerCase();
  if (!normalized) return "";
  if (normalized.startsWith("image/")) return "image";
  if (normalized.startsWith("video/")) return "video";
  if (normalized.startsWith("audio/")) return "audio";
  return "document";
};

export const getCloudinaryResourceType = (fileType) => {
  if (fileType === "video") return "video";
  if (fileType === "audio" || fileType === "document") return "raw";
  return "image";
};

export const resolveUploadSource = (file, fallbackBody = {}) => {
  if (file?.buffer && file?.mimetype) {
    const base64 = file.buffer.toString("base64");
    return `data:${file.mimetype};base64,${base64}`;
  }

  if (file?.path) return file.path;

  const fileData =
    typeof fallbackBody.fileData === "string"
      ? fallbackBody.fileData.trim()
      : "";
  if (fileData) return fileData;

  const fileUrl =
    typeof fallbackBody.fileUrl === "string" ? fallbackBody.fileUrl.trim() : "";
  if (fileUrl) return fileUrl;

  return "";
};

export const resolveFileTypeForUpload = (inputFileType, file) => {
  const normalizedInput = normalizeFileType(inputFileType);
  if (normalizedInput && ALLOWED_FILE_TYPES.has(normalizedInput)) {
    return normalizedInput;
  }

  const inferredType = inferFileTypeFromMime(file?.mimetype);
  if (ALLOWED_FILE_TYPES.has(inferredType)) return inferredType;

  return "";
};

export const buildUploadResponseItem = (uploadResult, fileType, file) => ({
  url: uploadResult.secure_url || uploadResult.url || "",
  publicId: uploadResult.public_id || "",
  fileType,
  resourceType: uploadResult.resource_type || getCloudinaryResourceType(fileType),
  filename: file?.originalname || uploadResult.original_filename || "",
  mimeType: file?.mimetype || "",
  size: Number(file?.size || uploadResult.bytes || 0),
  format: uploadResult.format || "",
  width: uploadResult.width || null,
  height: uploadResult.height || null,
  durationSeconds: Number(uploadResult.duration || 0),
});

const normalizeFolder = (folder, defaultFolder, fileType) => {
  if (typeof folder === "string" && folder.trim()) return folder.trim();
  return `${defaultFolder}/${fileType}`;
};

export const uploadFileService = async ({
  file = null,
  body = {},
  fileType = "",
  folder = "",
  defaultFolder = "stickhere/uploads",
  uploadOptions = {},
} = {}) => {
  assertCloudinaryConfigured();

  const finalFileType = resolveFileTypeForUpload(fileType || body.fileType, file);
  if (!finalFileType) {
    throw new StorageServiceError(
      "Invalid or missing fileType. Allowed values: image, video, document, audio, gif, sticker",
      400,
    );
  }

  const source = resolveUploadSource(file, body);
  if (!source) {
    throw new StorageServiceError(
      "No file source. Use multipart file, fileData, or fileUrl",
      400,
    );
  }

  const finalFolder = normalizeFolder(folder || body.folder, defaultFolder, finalFileType);
  const resourceType = getCloudinaryResourceType(finalFileType);

  try {
    const uploadResult = await cloudinary.uploader.upload(source, {
      folder: finalFolder,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      invalidate: true,
      ...uploadOptions,
    });

    return {
      fileType: finalFileType,
      folder: finalFolder,
      resourceType,
      uploadResult,
      file: buildUploadResponseItem(uploadResult, finalFileType, file),
    };
  } catch (error) {
    throw new StorageServiceError(
      "Cloudinary upload failed",
      502,
      error?.message || error,
    );
  }
};

export const uploadFilesService = async ({
  files = [],
  body = {},
  fileType = "",
  folder = "",
  defaultFolder = "stickhere/uploads",
  uploadOptions = {},
} = {}) => {
  if (!Array.isArray(files) || files.length === 0) {
    throw new StorageServiceError("No files provided", 400);
  }

  const tasks = files.map((file) =>
    uploadFileService({
      file,
      body,
      fileType,
      folder,
      defaultFolder,
      uploadOptions,
    }),
  );

  return Promise.all(tasks);
};

export const deleteFileService = async ({
  publicId,
  fileType = "image",
} = {}) => {
  assertCloudinaryConfigured();

  const finalPublicId = String(publicId || "").trim();
  if (!finalPublicId) {
    throw new StorageServiceError("publicId is required", 400);
  }

  const normalizedFileType = normalizeFileType(fileType || "image") || "image";
  const resourceType = getCloudinaryResourceType(normalizedFileType);

  try {
    const result = await cloudinary.uploader.destroy(finalPublicId, {
      resource_type: resourceType,
      invalidate: true,
    });

    return {
      publicId: finalPublicId,
      resourceType,
      result: result?.result || "ok",
      notFound: result?.result === "not found",
    };
  } catch (error) {
    throw new StorageServiceError(
      "Cloudinary delete failed",
      502,
      error?.message || error,
    );
  }
};

export const createUploadSignatureService = async ({
  fileType = "image",
  folder = "",
  defaultFolder = "stickhere/uploads",
} = {}) => {
  assertCloudinaryConfigured();

  const normalizedFileType = normalizeFileType(fileType) || "image";
  const resourceType = getCloudinaryResourceType(normalizedFileType);
  const finalFolder = normalizeFolder(folder, defaultFolder, normalizedFileType);

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    timestamp,
    folder: finalFolder,
    resource_type: resourceType,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET,
  );

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    timestamp,
    signature,
    folder: finalFolder,
    fileType: normalizedFileType,
    resourceType,
  };
};
