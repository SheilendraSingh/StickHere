
import mongoose from "mongoose";

export const ATTACHMENT_TYPES = [
  "image",
  "video",
  "document",
  "audio",
  "gif",
  "sticker",
];

const attachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    fileType: {
      type: String,
      enum: ATTACHMENT_TYPES,
      required: true,
    },
    filename: {
      type: String,
      default: "",
      trim: true,
      maxlength: 255,
    },
    mimeType: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },
    extension: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
      maxlength: 20,
    },
    size: {
      type: Number,
      default: 0,
      min: 0,
    },
    width: {
      type: Number,
      default: 0,
      min: 0,
    },
    height: {
      type: Number,
      default: 0,
      min: 0,
    },
    durationSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
      index: true,
    },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
      index: true,
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      default: null,
      index: true,
    },
    source: {
      type: String,
      enum: ["upload", "url", "generated"],
      default: "upload",
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

attachmentSchema.pre("validate", function (next) {
  if (this.isDeleted && !this.deletedAt) {
    this.deletedAt = new Date();
  }
  if (!this.isDeleted && this.deletedAt) {
    this.deletedAt = null;
  }
  next();
});

attachmentSchema.index({ uploadedBy: 1, createdAt: -1 });
attachmentSchema.index({ room: 1, createdAt: -1 });
attachmentSchema.index({ conversation: 1, createdAt: -1 });
attachmentSchema.index({ message: 1 });

const Attachment =
  mongoose.models.Attachment || mongoose.model("Attachment", attachmentSchema);

export default Attachment;
