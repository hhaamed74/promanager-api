const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: "المستخدم غير موجود" });
      }

      if (!req.user.isActive) {
        return res.status(401).json({ success: false, message: "الحساب معطل" });
      }

      return next(); // التأكد من وجود return لضمان عدم الاستمرار في حال الخطأ
    } catch (error) {
      return res
        .status(401)
        .json({ success: false, message: "التوكن غير صالح" });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "برجاء تسجيل الدخول أولاً" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `غير مسموح لهذا الدور (${req.user?.role}) بالوصول`,
      });
    }
    next();
  };
};

// الطريقة الأضمن للتصدير في بيئة Vercel
module.exports = { protect, authorize };
