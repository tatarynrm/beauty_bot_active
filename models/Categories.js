const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
    },
    userId: {
      type: String,
      unique: true,
    },
    username: {
      type: String,
    },
    firstName: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
