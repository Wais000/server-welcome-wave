// Import required modules and packages
const Accommodation = require("../models/accommodationMod"); // Correct path to the model
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const mongoDbValidation = require("../utils/mongoDbValidation");

// Function to create a new accommodation
const createAccommodation = asyncHandler(async (req, res) => {
  try {
    const newAccommodation = await Accommodation.create(req.body);
    res.json(newAccommodation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Function to get a single accommodation by its ID
const getAccommodation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const findAccommodation = await Accommodation.findById(id);
    if (!findAccommodation) {
      return res.status(404).json({ message: "Accommodation not found" });
    }
    res.json(findAccommodation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


const updateAccommodation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  mongoDbValidation(id);
  try {
    const updateAccommodation = await Accommodation.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateAccommodation);
  } catch (error) {
    throw new Error(error);
  }
});


// Function to delete an accommodation by its ID
const deleteAccommodation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  mongoDbValidation(id);
  try {
    const deletedAccommodation = await Accommodation.findByIdAndDelete(id);
    if (!deletedAccommodation) {
      return res.status(404).json({ message: "Accommodation not found" });
    }
    res.json(deletedAccommodation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Function to get all accommodations with filtering, sorting, pagination, and field limiting
const getAllAccommodation = asyncHandler(async (req, res) => {
  try {
    const queryObject = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((field) => delete queryObject[field]);

    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Accommodation.find(JSON.parse(queryStr));

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
      const accommodationCount = await Accommodation.countDocuments();
      if (skip >= accommodationCount) throw new Error("Page does not exist");
    }

    const accommodations = await query;
    res.json(accommodations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  createAccommodation,
  getAccommodation,
  getAllAccommodation,
  updateAccommodation,
  deleteAccommodation
};
