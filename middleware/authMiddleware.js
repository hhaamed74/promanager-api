const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * 1. Protect Middleware
 * التحقق من التوكن وصلاحية المستخدم
 */
exports.protect = async (req, res, next) => {
  let token;

  // التحقق من وجود التوكن في الـ Header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // استخراج التوكن
      token = req.headers.authorization.split(" ")[1];

      // فك تشفير التوكن
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // جلب بيانات المستخدم والتأكد أنه موجود ونشط
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "هذا المستخدم لم يعد موجوداً بالسيستم",
        });
      }

      // التحقق من حالة الحساب (خاصية التعطيل)
      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: "هذا الحساب معطل حالياً، تواصل مع المسؤول",
        });
      }

      return next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      return res.status(401).json({
        success: false,
        message: "الجلسة انتهت، برجاء تسجيل الدخول مرة أخرى",
      });
    }
  }

  // إذا لم يتم إرسال توكن من الأساس
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "غير مسموح بالدخول، برجاء تسجيل الدخول أولاً",
    });
  }
};

/**
 * 2. Authorize Middleware
 * تحديد الصلاحيات بناءً على الأدوار (Admin, User)
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "غير مصرح لك، البيانات مفقودة",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `الدور الحالي (${req.user.role}) لا يملك صلاحية الوصول لهذا القسم`,
      });
    }

    next();
  };
};
