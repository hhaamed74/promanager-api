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

// --- المسارات العامة (Public) ---
router.post("/register", register);
router.post("/login", login);

// --- مسارات المستخدم المسجل (Private) ---
// تم ربط رفع الصورة الشخصية (avatar) بالمجلد المحلي عبر الـ uploadMiddleware
router.put("/profile", protect, upload.single("avatar"), updateUserProfile);

// --- مسارات الإدارة (Admin Only) ---
// يفضل حماية الإحصائيات والنشاطات بحيث لا يراها إلا الأدمن
router.get("/users", protect, authorize("admin"), getAllUsers);
router.get("/activities", protect, authorize("admin"), getActivities);
router.get("/stats", protect, authorize("admin"), getDashboardStats);

router.delete("/users/:id", protect, authorize("admin"), deleteUser);
router.put("/users/:id/toggle", protect, authorize("admin"), toggleUserStatus);

module.exports = router;
