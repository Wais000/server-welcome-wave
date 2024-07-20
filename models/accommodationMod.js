const mongoose = require("mongoose");

// Schema for address details
const addressSchema = new mongoose.Schema(
  {
    street: {
      type: String,
      // required: true,
    },
    description: {
      type: String,
      // required: true,
    },
    country: {
      type: String,
      // required: true,
    },
    city: {
      type: String,
      // required: true,
    },
  },
  { _id: false }
);

// Schema for overview details
const overviewSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      // required: true,
    },
    rooms: {
      type: Number,
      // required: true,
    },
    bathrooms: {
      type: Number,
      // required: true,
    },
    garage: {
      type: Number,
      // required: true,
    },
  },
  { _id: false }
);

// Main schema for accommodation
const accommodationSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      // required: true,
    },
    addresses: {
      type: [addressSchema],
      validate: [arrayLimit, '{PATH} exceeds the limit of 3'],
    },
    overview: [overviewSchema],
    type: {
      type: String,
      // required: true,
    },
    capacity: {
      type: Number,
      // required: true,
    },
    owner: {
      type: String,
      // required: true,
    },
    contact: {
      type: Number,
      // required: true,
    },
    email: {
      type: String,
      // required: true,
    },
    startDate: {
      type: Date,
      // required: true,
    },
    endDate: {
      type: Date,
      // required: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    images: [
      {
        public_id: {
          type: String,
          // required: true,
        },
        url: {
          type: String,
          // required: true,
        },
      },
    ],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
  },
  { timestamps: true }
);

// Validator function to limit the array size
function arrayLimit(val) {
  return val.length <= 3;
}

module.exports = mongoose.model("Accommodation", accommodationSchema);
