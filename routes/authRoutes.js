const express = require("express"); // Import the Express framework
const router = express.Router(); // Initialize the Express router
const upload = require("../middleware/uploadMiddleware"); // Import Multer middleware for handling file uploads
const {
  register,
  login,
  updateUserProfile,
  getAllUsers,
  getDashboardStats,
  deleteUser,
  toggleUserStatus,
  getActivities,
} = require("../controllers/authController"); // Import authentication and user controller functions

const { protect, authorize } = require("../middleware/authMiddleware"); // Import custom security middlewares

/**
 * Public Routes
 * Accessible by anyone without authentication
 */
router.post("/register", register); // Endpoint for new user registration
router.post("/login", login); // Endpoint for user authentication and login

/**
 * User Profile Routes
 * Protected routes requiring a valid token and supporting file uploads
 */
// The upload.single('avatar') must be called before the controller to parse multipart/form-data
router.put("/profile", protect, upload.single("avatar"), updateUserProfile);

/**
 * Admin Management Routes
 * Restricted to users with the 'admin' role only
 */
router.get("/users", protect, authorize("admin"), getAllUsers); // Fetch a list of all registered users
router.get("/activities", protect, authorize("admin"), getActivities); // Retrieve recent admin/user activity logs

/**
 * Dashboard and Statistics
 */
router.get("/stats", getDashboardStats); // Get high-level system statistics (projects, users, etc.)

/**
 * User Administrative Actions
 * Manage user accounts directly from the dashboard
 */
router.delete("/users/:id", protect, authorize("admin"), deleteUser); // Permanently delete a specific user account
router.put("/users/:id/toggle", protect, authorize("admin"), toggleUserStatus); // Activate or deactivate a user account

module.exports = router; // Export the router for use in server.js
