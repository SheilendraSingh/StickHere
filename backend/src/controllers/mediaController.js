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

const DEFAULT_MEDIA_FOLDER = "stickhere/media";

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

const getUploadSource = (req) => {
  if (req.file?.buffer && req.file.mimetype) {
    const base64 = req.file.buffer.toString("base64");
    return `data:${req.file.mimetype};base64,${base64}`;
  }
  if (req.file?.path) return req.file.path;
  if (typeof req.body?.fileData === "string" && req.body.fileData.trim()) {
    return req.body.fileData.trim();
  }
  if (typeof req.body?.fileUrl === "string" && req.body.fileUrl.trim()) {
    return req.body.fileUrl.trim();
  }
  return "";
};

const buildAttachmentPayload = (uploadResult, req, fileType) => ({
  url: uploadResult.secure_url || uploadResult.url || "",
  fileType,
  filename:
    req.body?.filename?.trim() ||
    req.file?.originalname ||
    uploadResult.original_filename ||
    "",
  mimeType: req.file?.mimetype || req.body?.mimeType || "",
  size: Number(req.file?.size || uploadResult.bytes || 0),
  durationSeconds: Number(uploadResult.duration || 0),
});

export const uploadMedia = async (req, res) => {
  try {
    assertCloudinaryConfigured();

    const incomingFileType =
      normalizeFileType(req.body?.fileType) ||
      inferFileTypeFromMime(req.file?.mimetype || req.body?.mimeType);

    if (!ALLOWED_FILE_TYPES.has(incomingFileType)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid fileType. Allowed values: image, video, document, audio, gif, sticker",
      });
    }

    const uploadSource = getUploadSource(req);
    if (!uploadSource) {
      return res.status(400).json({
        success: false,
        message:
          "Missing file source. Provide multipart file, fileData, or fileUrl",
      });
    }

    const uploadFolder =
      typeof req.body?.folder === "string" && req.body.folder.trim()
        ? req.body.folder.trim()
        : `${DEFAULT_MEDIA_FOLDER}/${incomingFileType}`;

    const uploadResult = await cloudinary.uploader.upload(uploadSource, {
      folder: uploadFolder,
      resource_type: getCloudinaryResourceType(incomingFileType),
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      invalidate: true,
    });

    const attachment = buildAttachmentPayload(
      uploadResult,
      req,
      incomingFileType,
    );

    return res.status(201).json({
      success: true,
      message: "Media uploaded successfully",
      attachment,
      media: {
        publicId: uploadResult.public_id,
        resourceType: uploadResult.resource_type,
        format: uploadResult.format,
        width: uploadResult.width || null,
        height: uploadResult.height || null,
        bytes: uploadResult.bytes || 0,
      },
    });
  } catch (error) {
    console.error("Upload media error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while uploading media",
      error: error.message,
    });
  }
};

export const deleteMedia = async (req, res) => {
  try {
    assertCloudinaryConfigured();

    const publicId =
      (typeof req.params?.publicId === "string" &&
        req.params.publicId.trim()) ||
      (typeof req.body?.publicId === "string" && req.body.publicId.trim()) ||
      "";

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "publicId is required",
      });
    }

    const normalizedFileType = normalizeFileType(req.body?.fileType || "image");
    const resourceType = getCloudinaryResourceType(normalizedFileType);

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });

    if (result?.result === "not found") {
      return res.status(404).json({
        success: false,
        message: "Media not found on Cloudinary",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Media deleted successfully",
      result: result?.result || "ok",
    });
  } catch (error) {
    console.error("Delete media error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting media",
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
      `${DEFAULT_MEDIA_FOLDER}/${fileType}`;

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
