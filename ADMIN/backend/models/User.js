const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // =====================================================
    // BASIC USER INFORMATION
    // =====================================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["farmer", "customer", "admin", "deliveryBoy"],
      required: true,
    },

    accountStatus: {
      type: String,
      enum: ["Active", "Blocked"],
      default: "Active",
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: function () {
        return this.role === "farmer" ? "pending" : "approved";
      },
    },

    // =====================================================
    // USER CONTACT INFORMATION
    // =====================================================

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // FARMER PROFILE
    // =====================================================

    farmName: {
      type: String,
      default: "",
      trim: true,
    },

    farmSize: {
      type: String,
      default: "",
      trim: true,
    },

    bio: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // PROFILE IMAGE
    // =====================================================

    profileImage: {
      type: String,
      default: "",
    },

    // =====================================================
    // ADMIN / USER PREFERENCES
    // =====================================================

    preferences: {
      darkMode: {
        type: Boolean,
        default: false,
      },

      emailNotify: {
        type: Boolean,
        default: true,
      },

      smsNotify: {
        type: Boolean,
        default: false,
      },

      language: {
        type: String,
        enum: ["English", "Hindi", "Marathi"],
        default: "English",
      },
    },
  },
  {
    timestamps: true,
  },
);

// =====================================================
// EXPORT USER MODEL
// =====================================================

module.exports = mongoose.model("User", userSchema);
