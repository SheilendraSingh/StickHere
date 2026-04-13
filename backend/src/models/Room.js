import mongoose from "mongoose";

const hasMinLengthIfProvided = (value) => {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized.length === 0 || normalized.length >= 2;
};

const roomSchema = new mongoose.Schema(
  {
    roomName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 120,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    type: {
      type: String,
      enum: ["world", "country", "state", "city", "group"],
      required: true,
    },
    country: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
      validate: {
        validator: hasMinLengthIfProvided,
        message: "Country must be at least 2 characters when provided",
      },
    },

    state: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
      validate: {
        validator: hasMinLengthIfProvided,
        message: "State must be at least 2 characters when provided",
      },
    },

    city: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
      validate: {
        validator: hasMinLengthIfProvided,
        message: "City must be at least 2 characters when provided",
      },
    },
    description: {
      type: String,
      default: "",
      maxlength: 500,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

roomSchema.virtual("isGroupChat").get(function () {
  return this.type === "group";
});

roomSchema.pre("save", function () {
  if (Array.isArray(this.users) && this.users.length > 0) {
    const uniqueUserIds = [...new Set(this.users.map((id) => id.toString()))];
    this.users = uniqueUserIds.map((id) => new mongoose.Types.ObjectId(id));
  }
});

roomSchema.pre("validate", function () {
  const hasCountry = this.country && this.country.trim() !== "";
  const hasState = this.state && this.state.trim() !== "";
  const hasCity = this.city && this.city.trim() !== "";

  if (this.type === "country" && !hasCountry) {
    this.invalidate("country", "Country is required for country rooms");
  }

  if (this.type === "state" && (!hasCountry || !hasState)) {
    this.invalidate("state", "Country and state are required for state rooms");
  }

  if (this.type === "city" && (!hasCountry || !hasState || !hasCity)) {
    this.invalidate(
      "city",
      "Country, state, and city are required for city rooms",
    );
  }

  if (this.type === "group") {
    this.country = "";
    this.state = "";
    this.city = "";
  }
  if (this.type === "world") {
    this.country = "";
    this.state = "";
    this.city = "";
  }
});
const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);

export default Room;
