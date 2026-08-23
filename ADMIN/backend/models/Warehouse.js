const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema(
    {
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        warehouseName: {
            type: String,
            required: true,
            trim: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        address: {
            type: String,
            trim: true
        },

        city: {
            type: String,
            trim: true
        },

        state: {
            type: String,
            trim: true
        },

        pincode: {
            type: String,
            trim: true
        },

        totalStorage: {
            type: Number,
            required: true,
            min: 0
        },

        usedStorage: {
            type: Number,
            default: 0,
            min: 0
        },

        availableStorage: {
            type: Number,
            default: 0,
            min: 0
        },

        storageUnit: {
            type: String,
            enum: ["kg", "ton", "quintal"],
            default: "kg"
        },

        storageValue: {
            type: Number,
            default: 0
        },

        totalProducts: {
            type: Number,
            default: 0,
            min: 0
        },

        lowStockAlert: {
            type: Boolean,
            default: false
        },

        outOfStockAlert: {
            type: Boolean,
            default: false
        },

        status: {
            type: String,
            enum: ["Active", "Inactive", "Maintenance"],
            default: "Active"
        },

        description: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);


// ==========================================
// AUTOMATIC AVAILABLE STORAGE CALCULATION
// ==========================================
warehouseSchema.pre("save", function () {
    this.availableStorage = Math.max(
        this.totalStorage - this.usedStorage,
        0
    );
});


module.exports = mongoose.model("Warehouse", warehouseSchema);