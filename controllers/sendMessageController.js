const Message = require("../models/messageModel");
const Job = require("../models/jobModel");
const Accommodation = require("../models/accommodationMod");
const Help = require("../models/helpModel");
const asyncHandler = require("express-async-handler");


const sendMessage = asyncHandler(async (req, res) => {
  const { type, referenceId, name, email, message } = req.body;

  let user;

  // Find the relevant document and user who posted it
  if (type === 'accommodation') {
    const accommodation = await Accommodation.findById(referenceId).populate('postedBy');
    if (!accommodation) {
      res.status(404);
      throw new Error("Accommodation not found");
    }
    user = accommodation.postedBy;
  } else if (type === 'job') {
    const job = await Job.findById(referenceId).populate('postedBy');
    if (!job) {
      res.status(404);
      throw new Error("Job not found");
    }
    user = job.postedBy;
  } else if (type === 'help') {
    const help = await Help.findById(referenceId).populate('postedBy');
    if (!help) {
      res.status(404);
      throw new Error("Help request not found");
    }
    user = help.postedBy;
  } else {
    res.status(400);
    throw new Error("Invalid type");
  }

  // Create a new message
  const newMessage = await Message.create({
    name,
    email,
    message,
    type,
    referenceId,
    user: user._id,
  });

  // Here you would add the logic to send an SMS or email to the user if required

  res.status(201).json(newMessage);
});

module.exports = { sendMessage };
