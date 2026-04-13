import mongoose from "mongoose";
const attachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      enum: ["image", "video", "document", "audio", "gif", "sticker"],
      required: true,
    },
    filename: {
      type: String,
      default: "",
      trim: true,
    },
    mimeType: {
      type: String,
      default: "",
      trim: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    text: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    messageType: {
      type: String,
      enum: [
        "text",
        "image",
        "video",
        "document",
        "audio",
        "gif",
        "sticker",
        "mixed",
      ],
      default: "text",
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    reactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reaction",
      },
    ],
  },
  { timestamps: true },
);

messageSchema.pre("validate", function () {
  const hasText = typeof this.text === "string" && this.text.trim().length > 0;
  const hasAttachments =
    Array.isArray(this.attachments) && this.attachments.length > 0;

  if (!hasText && !hasAttachments) {
    this.invalidate(
      "text",
      "Message must contain text or at least one attachment",
    );
  }

  // Keep type consistent with payload shape
  if (hasAttachments && hasText && this.messageType === "text") {
    this.messageType = "mixed";
  }
});

messageSchema.index({ room: 1, createdAt: -1 });

const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;
