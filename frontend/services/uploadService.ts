import api, { getApiErrorMessage } from "@/services/api";

interface UploadFileResult {
  url: string;
  publicId: string;
  fileType: string;
  resourceType: string;
  filename: string;
  mimeType: string;
  size: number;
  format: string;
  width: number | null;
  height: number | null;
  durationSeconds: number;
}

interface UploadEnvelope {
  success: boolean;
  message?: string;
  file?: UploadFileResult;
  files?: UploadFileResult[];
  count?: number;
}

export const uploadSingleFile = async (
  file: File,
  fileType = "",
): Promise<UploadFileResult> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (fileType) formData.append("fileType", fileType);

    const { data } = await api.post<UploadEnvelope>("/uploads/single", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (!data.file) throw new Error("Upload response is invalid");
    return data.file;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to upload file"));
  }
};

export const uploadMultipleFiles = async (
  files: File[],
  fileType = "",
): Promise<UploadFileResult[]> => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    if (fileType) formData.append("fileType", fileType);

    const { data } = await api.post<UploadEnvelope>("/uploads/multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data.files || [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to upload files"));
  }
};

export const deleteUploadedFile = async (
  publicId: string,
  fileType = "image",
): Promise<void> => {
  try {
    await api.delete(`/uploads/${encodeURIComponent(publicId)}`, {
      data: { fileType },
    });
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to delete uploaded file"));
  }
};
