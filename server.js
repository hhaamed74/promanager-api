const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// تحميل متغيرات البيئة
dotenv.config();

// 1. الاتصال بقاعدة البيانات
connectDB();

const app = express();

// 2. إعدادات الـ CORS
// في الإنتاج، يفضل تحديد رابط الفرونت إند الخاص بك بدلاً من "*" لزيادة الأمان
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Middlewares الأساسية لمعالجة البيانات القادمة
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ملحوظة: حذفنا كود الـ fs و express.static الخاص بمجلد uploads لأنه لم يعد مطلوباً مع Cloudinary

// 3. تعريف الروابط (Routes)
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));

app.get("/", (req, res) => {
  res.send("ProManager API is running correctly via Cloudinary...");
});

// 4. معالجة الروابط غير الموجودة (404)
app.use((req, res, next) => {
  const error = new Error(`المسار غير موجود - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// 5. معالج الأخطاء العالمي (Global Error Handler)
app.use((err, req, res, next) => {
  console.error("Critical Error Info:", {
    message: err.message,
    stack: err.stack,
  });

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || "خطأ داخلي في الخادم",
    // لا يظهر الـ stack إلا في وضع التطوير
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// 6. تشغيل السيرفر
// Vercel يتعامل مع الملف كموديول، لذا نترك app.listen للتشغيل المحلي فقط
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`🚀 Server running locally on port ${PORT}`)
  );
}

// ضروري جداً لـ Vercel
module.exports = app;
