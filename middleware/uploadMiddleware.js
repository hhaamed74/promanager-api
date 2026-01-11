const multer = require("multer"); // Import Multer for handling multipart/form-data (file uploads)
const path = require("path"); // Import Path module to handle file extensions

// 1. Storage Configuration: Defines the destination and filename logic
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Files will be stored in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using the current timestamp and the original file name
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// 2. File Filter Configuration: Ensures only specific image types are allowed
const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp/; // Allowed extensions: jpg, jpeg, png, webp
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/; // Allowed MIME types

  // Validate the file extension and the mimetype
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true); // Accept the file
  } else {
    // Reject the file with an Arabic error message for the user
    cb(new Error("مسموح برفع الصور فقط (jpg, png, webp)"), false);
  }
};

// 3. Multer Middleware Initialization
const upload = multer({
  storage, // Apply the storage configuration defined above
  fileFilter, // Apply the file type restrictions
  limits: { fileSize: 5 * 1024 * 1024 }, // Set maximum file size limit to 5MB
});

module.exports = upload; // Export the upload middleware for use in routes
