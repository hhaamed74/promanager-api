const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats,
  getMyProjects,
} = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");

// 1. المسارات الثابتة (Static Routes) - يجب أن تكون في البداية
router.get("/my-projects", protect, getMyProjects);
router.get("/stats/count", protect, getProjectStats);

// 2. المسارات التي تتعامل مع الجذر "/"
router
  .route("/")
  .get(protect, getProjects)
  .post(protect, upload.single("image"), createProject);

// 3. المسارات التي تحتوي على معاملات (Dynamic IDs) - يجب أن تكون في النهاية
router
  .route("/:id")
  .get(protect, getProjectById)
  .put(protect, upload.single("image"), updateProject)
  .delete(protect, deleteProject);

module.exports = router;
