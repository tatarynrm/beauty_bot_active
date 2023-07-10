const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    userRole: {
      type: String,
    },
    userId: {
      type: String,
      unique: true,
    },
    userName: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    userFullName: {
      type: String,
    },
    userPhoneNumber: {
      type: String,
    },
    userCity: {
      type: String,
    },
    userService: {
      type: String,
    },
    userPhoto: {
      type: String,
    },
    userOfice: {
      type: String,
    },
    userDescription: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
