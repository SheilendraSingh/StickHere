
import cloudinary, {
  assertCloudinaryConfigured,
} from "../config/cloudinary.js";

const ALLOWED_FILE_TYPES = new Set([
  "image",
  "video",
  "document",
  "audio",
  "gif",
  "sticker",
]);

const DEFAULT_UPLOAD_FOLDER = "stickhere/uploads";

const normalizeFileType = (value = "") => String(value).trim().toLowerCase();

const inferFileTypeFromMime = (mimeType = "") => {
  const normalized = String(mimeType).trim().toLowerCase();
  if (!normalized) return "";
  if (normalized.startsWith("image/")) return "image";
  if (normalized.startsWith("video/")) return "video";
  if (normalized.startsWith("audio/")) return "audio";
  return "document";
};

const getCloudinaryResourceType = (fileType) => {
  if (fileType === "video") return "video";
  if (fileType === "audio" || fileType === "document") return "raw";
  return "image";
};

const resolveUploadSource = (file, fallbackBody = {}) => {
  if (file?.buffer && file?.mimetype) {
    const base64 = file.buffer.toString("base64");
    return `data:${file.mimetype};base64,${base64}`;
  }
  if (file?.path) return file.path;

  const fileData =
    typeof fallbackBody.fileData === "string" ? fallbackBody.fileData.trim() : "";
  if (fileData) return fileData;

  const fileUrl =
    typeof fallbackBody.fileUrl === "string" ? fallbackBody.fileUrl.trim() : "";
  if (fileUrl) return fileUrl;

  return "";
};

const buildUploadResponseItem = (uploadResult, fileType, file) => ({
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

const resolveFileTypeForUpload = (inputFileType, file) => {
  const normalizedInput = normalizeFileType(inputFileType);
  if (normalizedInput && ALLOWED_FILE_TYPES.has(normalizedInput)) {
    return normalizedInput;
  }

  const inferred = inferFileTypeFromMime(file?.mimetype);
  if (ALLOWED_FILE_TYPES.has(inferred)) return inferred;

  return "";
};

export const uploadSingle = async (req, res) => {
  try {
    assertCloudinaryConfigured();

    const fileType = resolveFileTypeForUpload(req.body?.fileType, req.file);
    if (!fileType) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or missing fileType. Allowed values: image, video, document, audio, gif, sticker",
      });
    }

    const source = resolveUploadSource(req.file, req.body);
    if (!source) {
      return res.status(400).json({
        success: false,
        message: "No file provided. Use multipart field `file`, fileData, or fileUrl",
      });
    }

    const folder =
      typeof req.body?.folder === "string" && req.body.folder.trim()
        ? req.body.folder.trim()
        : `${DEFAULT_UPLOAD_FOLDER}/${fileType}`;

    const uploadResult = await cloudinary.uploader.upload(source, {
      folder,
      resource_type: getCloudinaryResourceType(fileType),
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      invalidate: true,
    });

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      file: buildUploadResponseItem(uploadResult, fileType, req.file),
    });
  } catch (error) {
    console.error("Upload single file error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while uploading file",
      error: error.message,
    });
  }
};

export const uploadMultiple = async (req, res) => {
  try {
    assertCloudinaryConfigured();

    const files = Array.isArray(req.files) ? req.files : [];
    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No files provided. Use multipart field `files` or configure multer accordingly",
      });
    }

    const uploadTasks = files.map(async (file) => {
      const fileType = resolveFileTypeForUpload(req.body?.fileType, file);
      if (!fileType) {
        throw new Error(
          `Unsupported file type for ${file.originalname || "file"}`,
        );
      }

      const source = resolveUploadSource(file, req.body);
      if (!source) {
        throw new Error(`No upload source for ${file.originalname || "file"}`);
      }

      const folder =
        typeof req.body?.folder === "string" && req.body.folder.trim()
          ? req.body.folder.trim()
          : `${DEFAULT_UPLOAD_FOLDER}/${fileType}`;

      const uploadResult = await cloudinary.uploader.upload(source, {
        folder,
        resource_type: getCloudinaryResourceType(fileType),
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        invalidate: true,
      });

      return buildUploadResponseItem(uploadResult, fileType, file);
    });

    const uploaded = await Promise.all(uploadTasks);

    return res.status(201).json({
      success: true,
      message: "Files uploaded successfully",
      count: uploaded.length,
      files: uploaded,
    });
  } catch (error) {
    console.error("Upload multiple files error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while uploading files",
      error: error.message,
    });
  }
};

export const deleteUploadedFile = async (req, res) => {
  try {
    assertCloudinaryConfigured();

    const publicId =
      (typeof req.params?.publicId === "string" && req.params.publicId.trim()) ||
      (typeof req.body?.publicId === "string" && req.body.publicId.trim()) ||
      "";

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "publicId is required",
      });
    }

    const fileType = normalizeFileType(req.body?.fileType || "image");
    const resourceType = getCloudinaryResourceType(fileType);

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });

    if (result?.result === "not found") {
      return res.status(404).json({
        success: false,
        message: "File not found on Cloudinary",
      });
    }

    return res.status(200).json({
      success: true,
      message: "File deleted successfully",
      result: result?.result || "ok",
    });
  } catch (error) {
    console.error("Delete uploaded file error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting file",
      error: error.message,
    });
  }
};

export const getUploadSignature = async (req, res) => {
  try {
    assertCloudinaryConfigured();

    const fileType =
      normalizeFileType(req.body?.fileType || req.query?.fileType) || "image";
    const resourceType = getCloudinaryResourceType(fileType);

    const folder =
      (typeof req.body?.folder === "string" && req.body.folder.trim()) ||
      (typeof req.query?.folder === "string" && req.query.folder.trim()) ||
      `${DEFAULT_UPLOAD_FOLDER}/${fileType}`;

    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = {
      timestamp,
      folder,
      resource_type: resourceType,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET,
    );

    return res.status(200).json({
      success: true,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      timestamp,
      signature,
      folder,
      resourceType,
    });
  } catch (error) {
    console.error("Get upload signature error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while generating upload signature",
      error: error.message,
    });
  }
};
