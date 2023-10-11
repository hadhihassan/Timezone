const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    startingDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Offer = mongoose.model("Offer", offerSchema);

module.exports = Offer;
