const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
   location: {
      type: "string",
      //   required: true,
    },
    type: {
        type: "string",
        //   required: true,
      },
    jobProvider: {
      type: "String",
      //   required: true,
    },
  contact: {
      type: "number",
      required: true,
    },
  email: {
      type: "string",
      //   required: true,
    },

  start: {
      type: "string",
      //   required: true,
    },
  end: {
      type: "string",
      //   required: true,
    },

    lastActive: { type: Date, default: Date },
    images: [{ public_id: String, url: String }],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Job", jobSchema);
