// Import required modules and packages
const Help = require("../models/helpModel"); // Correct path to the model
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const mongoDbValidation = require("../utils/mongoDbValidation");

// Function to create a new accommodation
const createHelp = asyncHandler(async (req, res) => {
  try {
    const newHelp = await Help.create(req.body);
    res.json(newHelp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Function to get a single accommodation by its ID
const getHelp = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const findHelp = await Help.findById(id);
    if (!findHelp) {
      return res.status(404).json({ message: "Help not found" });
    }
    res.json(findHelp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


const updateHelp = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Validate MongoDB ID
  mongoDbValidation(id);

  try {
   
    const updateData = { ...req.body };
    delete updateData._id; // Ensure _id is not included in the update object

    // Update the document
    const updatedHelp = await Help.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedHelp) {
      return res.status(404).json({ message: 'Help document not found' });
    }

    res.json(updatedHelp);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});


// Function to delete an accommodation by its ID
const deleteHelp = asyncHandler(async (req, res) => {
  const { id } = req.params;
  mongoDbValidation(id);
  try {
    const deletedHelp = await Help.findByIdAndDelete(id);
    if (!deleteHelp) {
      return res.status(404).json({ message: "Help not found" });
    }
    res.json(deletedHelp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Function to get all accommodations with filtering, sorting, pagination, and field limiting
const getAllHelp = asyncHandler(async (req, res) => {
  try {
    const queryObject = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((field) => delete queryObject[field]);

    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Help.find(JSON.parse(queryStr));

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const HelpCount = await Help.countDocuments();
      if (skip >=HelpCount) throw new Error("Page does not exist");
    }

    const Helps = await query;
    res.json(Helps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  createHelp,
  getHelp,
  getAllHelp,
  updateHelp,
  deleteHelp
};
