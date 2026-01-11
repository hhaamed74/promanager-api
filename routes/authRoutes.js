const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  register,
  login,
  updateUserProfile,
  getAllUsers,
  getDashboardStats,
  deleteUser,
  toggleUserStatus,
  getActivities,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.put("/profile", protect, upload.single("avatar"), updateUserProfile);
router.get("/users", protect, authorize("admin"), getAllUsers);
router.get("/activities", protect, authorize("admin"), getActivities);
router.get("/stats", getDashboardStats);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);
router.put("/users/:id/toggle", protect, authorize("admin"), toggleUserStatus);

module.exports = router;
