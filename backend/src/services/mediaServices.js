
import mongoose from "mongoose";
import Attachment from "../models/Attachment.js";
import {
  StorageServiceError,
  createUploadSignatureService,
  deleteFileService,
  uploadFileService,
  uploadFilesService,
} from "./storageServices.js";

export class MediaServiceError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = "MediaServiceError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

const toObjectIdOrNull = (value) => {
  if (!value) return null;
  if (!mongoose.Types.ObjectId.isValid(value)) return null;
  return new mongoose.Types.ObjectId(value);
};

const toAttachmentPayload = ({ file, uploadResult }) => ({
  url: file.url,
  publicId: file.publicId,
  fileType: file.fileType,
  filename: file.filename,
  mimeType: file.mimeType,
  extension: file.format || "",
  size: file.size || 0,
  width: file.width || 0,
  height: file.height || 0,
  durationSeconds: file.durationSeconds || 0,
  uploadedBy: uploadResult.uploadedBy,
  room: uploadResult.room,
  message: uploadResult.message,
  conversation: uploadResult.conversation,
  source: uploadResult.source,
  metadata: uploadResult.metadata,
});

const buildAttachmentResponse = (file) => ({
  url: file.url,
  fileType: file.fileType,
  filename: file.filename,
  mimeType: file.mimeType,
  size: file.size,
  durationSeconds: file.durationSeconds,
});

const parseAttachmentContext = (payload = {}) => ({
  uploadedBy: toObjectIdOrNull(payload.uploadedBy),
  room: toObjectIdOrNull(payload.room),
  message: toObjectIdOrNull(payload.message),
  conversation: toObjectIdOrNull(payload.conversation),
  source:
    payload.source === "url" || payload.source === "generated"
      ? payload.source
      : "upload",
  metadata:
    payload.metadata && typeof payload.metadata === "object"
      ? payload.metadata
      : {},
});

export const uploadMediaService = async ({
  file = null,
  body = {},
  uploadedBy = null,
  persist = false,
  defaultFolder = "stickhere/media",
} = {}) => {
  try {
    const upload = await uploadFileService({
      file,
      body,
      defaultFolder,
    });

    let attachmentRecord = null;
    if (persist) {
      const context = parseAttachmentContext({
        ...body,
        uploadedBy: uploadedBy || body.uploadedBy,
      });

      if (!context.uploadedBy) {
        throw new MediaServiceError(
          "uploadedBy is required when persist=true",
          400,
        );
      }

      attachmentRecord = await Attachment.create(
        toAttachmentPayload({
          file: upload.file,
          uploadResult: context,
        }),
      );
    }

    return {
      attachment: buildAttachmentResponse(upload.file),
      media: {
        publicId: upload.file.publicId,
        resourceType: upload.file.resourceType,
        format: upload.file.format,
        width: upload.file.width,
        height: upload.file.height,
        bytes: upload.file.size,
      },
      record: attachmentRecord,
    };
  } catch (error) {
    if (error instanceof StorageServiceError || error instanceof MediaServiceError) {
      throw error;
    }
    throw new MediaServiceError("Server error while uploading media", 500, error);
  }
};

export const uploadMultipleMediaService = async ({
  files = [],
  body = {},
  uploadedBy = null,
  persist = false,
  defaultFolder = "stickhere/media",
} = {}) => {
  try {
    const uploads = await uploadFilesService({
      files,
      body,
      defaultFolder,
    });

    let records = [];
    if (persist) {
      const context = parseAttachmentContext({
        ...body,
        uploadedBy: uploadedBy || body.uploadedBy,
      });

      if (!context.uploadedBy) {
        throw new MediaServiceError(
          "uploadedBy is required when persist=true",
          400,
        );
      }

      const docs = uploads.map((upload) =>
        toAttachmentPayload({
          file: upload.file,
          uploadResult: context,
        }),
      );

      records = await Attachment.insertMany(docs, { ordered: true });
    }

    return {
      count: uploads.length,
      files: uploads.map((upload) => upload.file),
      records,
    };
  } catch (error) {
    if (error instanceof StorageServiceError || error instanceof MediaServiceError) {
      throw error;
    }
    throw new MediaServiceError(
      "Server error while uploading multiple files",
      500,
      error,
    );
  }
};

export const deleteMediaService = async ({
  publicId,
  fileType,
  attachmentId = "",
  hardDeleteRecord = false,
} = {}) => {
  const deletion = await deleteFileService({ publicId, fileType });

  if (attachmentId && mongoose.Types.ObjectId.isValid(attachmentId)) {
    if (hardDeleteRecord) {
      await Attachment.deleteOne({ _id: attachmentId });
    } else {
      await Attachment.updateOne(
        { _id: attachmentId },
        { $set: { isDeleted: true, deletedAt: new Date() } },
      );
    }
  }

  return deletion;
};

export const getMediaUploadSignatureService = (params = {}) =>
  createUploadSignatureService({
    ...params,
    defaultFolder: params.defaultFolder || "stickhere/media",
  });
