const express = require("express");
const {
  createJob,
  getJob,
  getAllJob,
  updateJob,
  deleteJob
} = require("../controllers/jobController");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createJob);
router.get("/:id", getJob);
router.put("/:id", authMiddleware, isAdmin, updateJob);
router.delete("/:id", authMiddleware, isAdmin, deleteJob);
router.get("/", getAllJob);


module.exports = router;