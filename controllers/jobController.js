// Import required modules and packages
const Job = require("../models/JobModel"); // Correct path to the model
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const mongoDbValidation = require("../utils/mongoDbValidation");

// Function to create a new accommodation
const createJob = asyncHandler(async (req, res) => {
  try {
    const newJob = await Job.create(req.body);
    res.json(newJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Function to get a single accommodation by its ID
const getJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const findJob = await Job.findById(id);
    if (!findJob) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(findJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


const updateJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  mongoDbValidation(id);
  try {
    const updateJob = await Job.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateJob);
  } catch (error) {
    throw new Error(error);
  }
});


// Function to delete an accommodation by its ID
const deleteJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  mongoDbValidation(id);
  try {
    const deletedJob = await Job.findByIdAndDelete(id);
    if (!deleteJob) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(deletedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Function to get all accommodations with filtering, sorting, pagination, and field limiting
const getAllJob = asyncHandler(async (req, res) => {
  try {
    const queryObject = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((field) => delete queryObject[field]);

    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Job.find(JSON.parse(queryStr));

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
      const JobCount = await Job.countDocuments();
      if (skip >=JobCount) throw new Error("Page does not exist");
    }

    const Jobs = await query;
    res.json(Jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  createJob,
  getJob,
  getAllJob,
  updateJob,
  deleteJob
};
