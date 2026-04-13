
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
      default: "direct",
      index: true,
    },
    title: {
      type: String,
      default: "",
      trim: true,
      minlength: 1,
      maxlength: 120,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    avatar: {
      type: String,
      default: "",
      trim: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
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
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
      index: true,
    },
    directKey: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

const toObjectId = (id) => new mongoose.Types.ObjectId(id.toString());

conversationSchema.pre("validate", function () {
  if (Array.isArray(this.participants) && this.participants.length > 0) {
    const uniqueParticipantIds = [
      ...new Set(this.participants.map((id) => id.toString())),
    ];
    this.participants = uniqueParticipantIds.map(toObjectId);
  }

  if (Array.isArray(this.admins) && this.admins.length > 0) {
    const uniqueAdminIds = [...new Set(this.admins.map((id) => id.toString()))];
    this.admins = uniqueAdminIds.map(toObjectId);
  }

  const participantIdSet = new Set(
    (this.participants || []).map((id) => id.toString()),
  );
  const adminsAreParticipants = (this.admins || []).every((adminId) =>
    participantIdSet.has(adminId.toString()),
  );

  if (!adminsAreParticipants) {
    this.invalidate("admins", "All admins must be participants");
  }

  if (this.type === "direct") {
    if (!Array.isArray(this.participants) || this.participants.length !== 2) {
      this.invalidate(
        "participants",
        "Direct conversations require exactly two participants",
      );
    }
    this.title = "";
    this.avatar = "";
  }

  if (this.type === "group" && !this.title) {
    this.invalidate("title", "Group conversation title is required");
  }
});

conversationSchema.pre("save", function () {
  if (this.type === "direct" && Array.isArray(this.participants)) {
    const sorted = this.participants
      .map((id) => id.toString())
      .sort((a, b) => a.localeCompare(b));
    this.directKey = sorted.join(":");
  } else {
    this.directKey = null;
  }

  this.lastActivityAt = new Date();
});

conversationSchema.index({ participants: 1 });
conversationSchema.index({ participants: 1, updatedAt: -1 });
conversationSchema.index({ createdBy: 1, updatedAt: -1 });

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);

export default Conversation;
