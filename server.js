const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");

// تحميل الإعدادات
dotenv.config();

// 1. الاتصال بقاعدة البيانات
connectDB();

const app = express();

// 2. Middlewares الأساسية
app.use(
  cors({
    origin: "*", // في الإنتاج يفضل تحديد رابط الفرونت إند فقط
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- إدارة مجلد الرفع المحلي ---
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
// جعل مجلد الصور متاحاً للجمهور (Static) لكي يراها الفرونت إند
app.use("/uploads", express.static(uploadDir));

// 3. تعريف الروابط (Routes)
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));

app.get("/", (req, res) => {
  res.send("API is running correctly and images are hosted locally... 🚀");
});

// 4. معالجة 404
app.use((req, res, next) => {
  const error = new Error(`المسار غير موجود - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// 5. معالج الأخطاء العالمي
app.use((err, req, res, next) => {
  console.error("❌ Error Handler:", err.message);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || "حدث خطأ داخلي في السيرفر",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// 6. تشغيل السيرفر (تعديل لضمان التشغيل في كل البيئات)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ✅ Server is up!
  🌍 URL: http://localhost:${PORT}
  📂 Static: http://localhost:${PORT}/uploads
  `);
});

module.exports = app;
