const express = require("express"); // Load the Express framework
const cors = require("cors"); // Load CORS to allow the frontend to communicate with the backend
const dotenv = require("dotenv"); // Load dotenv to handle environment variables (.env)
const path = require("path"); // Load path module for managing file and directory paths
const connectDB = require("./config/db"); // Import the database connection function

// 1. Initialize environment variables
dotenv.config();

// 2. Connect to the MongoDB database
connectDB();

// Initialize the Express application
const app = express();

// 3. Essential Middlewares
app.use(cors()); // Enable CORS for all incoming requests
app.use(express.json()); // Middleware to parse and read JSON data from the request body

// 4. Set up the Static Folder for file uploads
// This line is crucial for making uploaded images accessible via browser URLs
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 5. Define Application Routes
// User authentication routes (Register, Login, Profile)
app.use("/api/auth", require("./routes/authRoutes"));

// Project management routes
app.use("/api/projects", require("./routes/projectRoutes"));

// 6. Root route for server health check
app.get("/", (req, res) => {
  res.send("API is running correctly...");
});

// 7. Handle non-existent routes (404 Error Handler)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Requested route not found on this server",
  });
});

// 8. Start the Server
const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000
app.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`
  );
});
