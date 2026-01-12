const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");

dotenv.config();

// 1. الاتصال بقاعدة البيانات
connectDB();

const app = express();

// 2. الأولوية للـ Middlewares الأساسية
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// التأكد من أن express.json() مستدعى قبل الـ Routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// إنشاء مجلد الرفع إذا لم يكن موجوداً
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use("/uploads", express.static(uploadDir));

// 3. تعريف الروابط (Routes)
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));

app.get("/", (req, res) => {
  res.send("API is running correctly...");
});

// 4. معالجة الروابط غير الموجودة (404)
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // تمرير الخطأ للمعالج العالمي
});

// 5. الحل الحاسم: معالج الأخطاء العالمي (Global Error Handler)
// يجب أن يحتوي على 4 معاملات بالترتيب: (err, req, res, next)
app.use((err, req, res, next) => {
  // طباعة الخطأ في التيرمينال لمعرفة المصدر الحقيقي (مثل Mongodb أو JWT)
  console.error("Critical Error Info:", {
    message: err.message,
    stack: err.stack,
  });

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // إظهار الـ stack فقط في بيئة التطوير للمساعدة في تتبع السطر المسبب
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// 6. تشغيل السيرفر
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;
