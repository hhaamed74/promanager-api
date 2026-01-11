const express = require("express"); // Import Express framework
const router = express.Router(); // Create an Express router instance
const upload = require("../middleware/uploadMiddleware"); // Import middleware for handling file uploads
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats,
  getMyProjects,
} = require("../controllers/projectController"); // Import project controller functions
const { protect } = require("../middleware/authMiddleware"); // Import authentication protection middleware

/**
 * Global Project Routes
 * Handling root path "/" for fetching all projects and creating new ones
 */
router
  .route("/")
  .get(protect, getProjects) // Protected route to fetch all projects
  .post(protect, upload.single("image"), createProject); // Protected route to create a project with an image upload

/**
 * User-Specific Project Routes
 */
router.get("/my-projects", protect, getMyProjects); // Fetch projects belonging to the logged-in user

/**
 * Project Statistics Routes
 */
router.get("/stats/count", protect, getProjectStats); // Get total count and statistics of projects

/**
 * Specific Project ID Routes
 * Handling operations for a single project by its ID
 */
router
  .route("/:id")
  .get(protect, getProjectById) // Fetch a single project detail by ID
  .put(protect, upload.single("image"), updateProject) // Update project info and optionally replace the image
  .delete(protect, deleteProject); // Delete a specific project by ID

module.exports = router; // Export the router to be used in server.js
