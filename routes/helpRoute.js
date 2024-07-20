const express = require("express");
const {
  createHelp,
  getHelp,
  getAllHelp,
  updateHelp,
  deleteHelp
} = require("../controllers/helpController");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createHelp);
router.get("/:id", getHelp);
router.put("/:id", authMiddleware, updateHelp);
router.delete("/:id", authMiddleware, deleteHelp);
router.get("/", getAllHelp);


module.exports = router;