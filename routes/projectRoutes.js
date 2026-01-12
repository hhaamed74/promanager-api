const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats,
  getMyProjects,
} = require("../controllers/projectController");

/**
 * 1. المسارات الخاصة (Static)
 * توضع في الأعلى لمنع Express من اعتبار "my-projects" كـ "id"
 */
router.get("/my-projects", protect, getMyProjects);
router.get("/stats/count", protect, getProjectStats);

/**
 * 2. مسارات الجذر (Root)
 * جلب الكل أو إنشاء مشروع جديد مع صورة محلياً
 */
router
  .route("/")
  .get(protect, getProjects) // عرض المشاريع للجميع المسجلين
  .post(protect, upload.single("image"), createProject); // رفع صورة المشروع للمجلد المحلي

/**
 * 3. المسارات الديناميكية (Dynamic)
 * التعامل مع مشروع محدد باستخدام الـ ID
 */
router
  .route("/:id")
  .get(protect, getProjectById)
  .put(protect, protect, upload.single("image"), updateProject) // تحديث البيانات أو الصورة
  .delete(protect, deleteProject);

module.exports = router;
