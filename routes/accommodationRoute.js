const express = require("express");
const {
  createAccommodation,
  getAccommodation,
  getAllAccommodation,
  updateAccommodation,
  deleteAccommodation
} = require("../controllers/accommodationController");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createAccommodation);
router.get("/:id", getAccommodation);
router.put("/:id", authMiddleware, updateAccommodation);
router.delete("/:id", authMiddleware,  deleteAccommodation);
router.get("/", getAllAccommodation);


module.exports = router;
