const express = require("express");
const {
  createUser,
  LoginUserController,
  getAllUsers,
  getSingUser,
  deleteSingUser,
  updatedUser,
  blockUser,
  unblockUser,
  HandelRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  saveAddress,
  updateProfilePicture,
  updateDashboardSettings,

} = require("../controllers/userController.js");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware.js");


const router = express.Router();



router.post("/register", createUser);
router.put("/password",authMiddleware, updatePassword);
router.post("/login", LoginUserController);
router.post("/admin-login", loginAdmin);
router.get("/all-users", getAllUsers);

router.post("/forgot-password-token", forgotPasswordToken);
router.put("/reset-password/:token", resetPassword);
router.get("/refresh", HandelRefreshToken);
router.get("/logout", logout);
router.get("/:id",authMiddleware,isAdmin, getSingUser);
router.delete("/:id", deleteSingUser);
// router.delete("/empty-cart", authMiddleware, emptyCart);
router.put(
  "/order/update-order/:id",
  authMiddleware,
  isAdmin,
  // updateOrderStatus
);
router.put("/edit-user",authMiddleware, updatedUser);
router.put("/block-user/:id",authMiddleware,isAdmin,blockUser );
router.put("/save-address", authMiddleware, saveAddress);
router.put("/unblock-user/:id",authMiddleware,isAdmin, unblockUser );
router.put("/profile-picture", authMiddleware, updateProfilePicture);
router.put("/dashboard-settings", authMiddleware, updateDashboardSettings);

module.exports = router;
