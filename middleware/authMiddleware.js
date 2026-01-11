const jwt = require("jsonwebtoken"); // Import JSON Web Token library for authentication
const User = require("../models/User"); // Import User model to verify users in the database

/**
 * 1. Protect Middleware
 * Ensures the user is logged in by verifying the JWT token
 */
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract the token from the "Bearer <token>" string
      token = req.headers.authorization.split(" ")[1];

      // Verify the token validity using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user data from DB and attach it to the request object (excluding password)
      req.user = await User.findById(decoded.id).select("-password");

      // Handle case where user no longer exists in the database
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "هذا المستخدم لم يعد موجوداً بالسيستم",
        });
      }

      // Check account status (Active/Inactive feature)
      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: "هذا الحساب معطل حالياً",
        });
      }

      // Proceed to the next middleware or controller
      return next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      return res.status(401).json({
        success: false,
        message: "التوكن غير صالح أو منتهي الصلاحية",
      });
    }
  }

  // Handle case where no token is provided in headers
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "غير مسموح بالدخول، برجاء تسجيل الدخول أولاً",
    });
  }
};

/**
 * 2. Authorize Middleware
 * Restricts access based on user roles (e.g., admin, user)
 * @param {...String} roles - List of allowed roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user data exists (should be populated by 'protect' middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "غير مصرح لك، البيانات مفقودة",
      });
    }

    // Verify if the current user's role is included in the permitted roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `الدور (${req.user.role}) غير مسموح له بالوصول لهذا المصدر`,
      });
    }

    // User is authorized, proceed to the next function
    next();
  };
};
